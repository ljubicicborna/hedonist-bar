/* =====================================================================
   NOVOSTI (početna) — tjedni događaji (npr. Music Night, Party Night).
   Uređuju se na /admin.html (spremljeno u data/dogadjaji.json). Ako se
   datoteka ne učita, koristi se REZERVA ispod.
===================================================================== */
(function(){
  var esc = function(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };
  var IMG = 'assets/images/gallery/';

  /* nema polja za sliku uz događaj, pa se svakoj kartici slika bira po
     ključnim riječima iz njenog vlastitog teksta -- tako svaka dobije
     sliku "u skladu s njom", a ne istu sliku kao sve ostale */
  var GIG_IMAGES = [
    { test: /party|house/i, src: 'disco-ball-bar.jpg' },
    { test: /music|glazb|dj\b|ex-yu/i, src: 'dj-set-motion.jpg' }
  ];
  var GIG_FALLBACK = 'monogram-bottles-disco.jpg';
  function pickGigImage(d){
    var haystack = (d.naziv || '') + ' ' + (d.opis || '');
    for (var i = 0; i < GIG_IMAGES.length; i++) { if (GIG_IMAGES[i].test.test(haystack)) return GIG_IMAGES[i].src; }
    return GIG_FALLBACK;
  }

  var REZERVA = [
    { dan: 'Petak', naziv: 'Music Night', opis: 'Ex-Yu glazba cijelu večer', aktivno: true },
    { dan: 'Subota', naziv: 'Party Night', opis: 'House zvuk do kasno u noć', aktivno: true }
  ];

  var homeGigs = document.getElementById('home-gigs');
  if (!homeGigs) return;

  function render(list){
    var active = list.filter(function(d){ return d.aktivno; });
    if (!active.length) return;
    homeGigs.innerHTML = active.map(function(d){
      return '' +
        '<div class="home-night">' +
          '<img class="home-night-photo" src="' + IMG + pickGigImage(d) + '" alt="" aria-hidden="true" loading="lazy">' +
          '<span class="home-night-day">' + esc(d.dan) + '</span>' +
          '<span class="home-night-name">' + esc(d.naziv) + '</span>' +
          (d.opis ? '<span class="home-night-tag">' + esc(d.opis) + '</span>' : '') +
        '</div>';
    }).join('');
  }

  render(REZERVA);
  fetch('data/dogadjaji.json')
    .then(function(r){ if (!r.ok) throw 0; return r.json(); })
    .then(function(data){ if (data && Array.isArray(data.dogadjaji) && data.dogadjaji.length) render(data.dogadjaji); })
    .catch(function(){ /* rezerva već iscrtana */ });
})();
