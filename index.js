const levenshtein = require('fast-levenshtein');
const CATEGORIES = require('./categories.json');
const FILENAMES = require('./filenames.json');

const reLoRusChars = /[^а-яё]/g;

function catNormBegins(cat) {
  return cat
    .split(/\s+/)
    .map(word => word.toLocaleLowerCase().replace(reLoRusChars, '').replace(/(..?.?)(.*)/, '$1'))
    .join(' ');
}

function catNormAbbr(cat) {
  return cat
    .split(/\s+/)
    .map(word => word.toLocaleLowerCase().replace(reLoRusChars, '').replace(/(.)(.*)/, '$1'))
    .join('');
}

function findCats(s, cats) {

  const catTransforms = [
    {
      f: cat => cat.toLocaleLowerCase(),
      k: 1
    },
    {
      f: cat => catNormBegins(cat),
      k: 2
    },
    {
      f: cat => catNormAbbr(cat),
      k: 1
    }
  ];

  const catsDists = cats
    .map(cat => {
      const dists = catTransforms.map(({ f, k }) => {
        const tcat = f(cat);
        const dist = levenshtein.get(s, tcat) * k;
        return { tcat, dist };
      });
      const totalDist = dists.reduce((sum, d) => sum + d.dist, 0);
      return { cat, dists, totalDist };
    })
    .sort((a, b) => a.totalDist - b.totalDist);

  return catsDists;
}

function show(filenames, cats) {
  filenames.forEach(filename => {
    const normFilename = filename
      .toLocaleLowerCase()
      .replace(reLoRusChars, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');
    const catsResult = findCats(normFilename, cats);
    console.log(
      filename,
      '\\',
      normFilename,
      '\n',
      catsResult
        .slice(0, 3)
        .map(d => [d.cat, d.totalDist, d.dists.map(dd => `${dd.tcat}: ${dd.dist}`).join('; ')]),
      '\n\n'
    )
  });
}

show(
  FILENAMES/*.slice(0, 100),*/.filter(fn => /техзад/i.test(fn)),
  CATEGORIES
);
