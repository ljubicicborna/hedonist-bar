/* /sitemap.xml -- generiran dinamički (vidi vercel.json rewrite), ne
   statična datoteka, da <lastmod> po stranici bude ISTINIT: prati
   stvarni datum zadnje CMS izmjene (Vercel Blob uploadedAt) za stranice
   koje crpe podatke iz CMS-a, umjesto fiksnog "danas" bez obzira je li
   se išta stvarno promijenilo -- Google eksplicitno kaže da nepouzdan
   lastmod uzrokuje da počnu ignorirati taj signal s cijele domene. */

import { list } from '@vercel/blob';

const SITE = 'https://hedonist-bar.vercel.app';

/* stvaran datum zadnje izmjene HTML/CSS/JS-a te stranice -- ažuriraj
   ručno kad se ta stranica stvarno mijenja u kodu. Za stranice s CMS
   sadržajem (vidi CMS_PREFIXES_BY_PAGE ispod) ovo je samo donja granica;
   noviji CMS upis (spremljen preko /admin.html) automatski podigne
   lastmod bez ikakve ručne izmjene ovdje. */
const STATIC_LASTMOD = {
  '/': '2026-07-19',
  '/cjenik.html': '2026-07-19',
  '/galerija.html': '2026-07-19',
  '/lokacija.html': '2026-07-19',
  '/zaposlenje.html': '2026-07-19',
  '/pitanja.html': '2026-07-19'
};

/* koje CMS Blob "prefixe" (vidi api/admin.js) treba provjeriti po
   stranici -- najnoviji uploadedAt među njima podiže lastmod iznad
   STATIC_LASTMOD ako je stvarno noviji */
const CMS_PREFIXES_BY_PAGE = {
  '/': ['cms/data/tekstovi-', 'cms/data/dogadjaji-'],
  '/cjenik.html': ['cms/data/cjenik-'],
  '/zaposlenje.html': ['cms/data/oglasi-', 'cms/data/tekstovi-']
};

const PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/cjenik.html', changefreq: 'daily', priority: '0.8' },
  { path: '/galerija.html', changefreq: 'weekly', priority: '0.6' },
  { path: '/lokacija.html', changefreq: 'monthly', priority: '0.7' },
  { path: '/zaposlenje.html', changefreq: 'daily', priority: '0.5' },
  { path: '/pitanja.html', changefreq: 'monthly', priority: '0.4' }
];

async function latestBlobTime(prefix) {
  try {
    const { blobs } = await list({ prefix });
    return blobs.reduce(function (max, b) {
      var t = new Date(b.uploadedAt).getTime();
      return t > max ? t : max;
    }, 0);
  } catch (e) {
    return 0;
  }
}

function fmt(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  const entries = await Promise.all(PAGES.map(async function (p) {
    var base = new Date(STATIC_LASTMOD[p.path] + 'T00:00:00Z').getTime();
    var prefixes = CMS_PREFIXES_BY_PAGE[p.path] || [];
    var cmsTimes = await Promise.all(prefixes.map(latestBlobTime));
    var newest = cmsTimes.reduce(function (max, t) { return t > max ? t : max; }, base);
    return { path: p.path, changefreq: p.changefreq, priority: p.priority, lastmod: fmt(newest) };
  }));

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.map(function (e) {
      return '  <url>\n' +
        '    <loc>' + SITE + e.path + '</loc>\n' +
        '    <lastmod>' + e.lastmod + '</lastmod>\n' +
        '    <changefreq>' + e.changefreq + '</changefreq>\n' +
        '    <priority>' + e.priority + '</priority>\n' +
        '  </url>\n';
    }).join('') +
    '</urlset>\n';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
