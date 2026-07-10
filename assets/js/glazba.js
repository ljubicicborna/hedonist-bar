/* =====================================================================
   ŽIVA GLAZBA — TABLICA PODATAKA
   ---------------------------------------------------------------------
   Ovo je jedina datoteka koju treba uređivati kad se mijenja program.

   1) IZVODJACI — popis svih izvođača koji su ikad zasvirali u Hedonistu.
      Svaki izvođač ima svoj "id" (kratka oznaka bez razmaka) koji se
      koristi u rasporedu dolje.
      - foto: putanja do slike (npr. 'assets/images/glazba/dj-maks.jpg').
        Ako slike nema, stranica sama prikaže zlatni krug s inicijalima.
      - instagram: puni link ili '' ako ga nema.

   2) RASPORED — tablica termina. Jedan red = jedna svirka:
      { datum: 'GGGG-MM-DD', vrijeme: 'HH:MM', izvodjac: 'id-izvodjaca' }
      Stranica SAMA prikaže samo termine koji padaju u tekući tjedan
      (ponedjeljak–nedjelja) — stari redovi ne smetaju, slobodno ih
      ostavi kao arhivu ili obriši.
===================================================================== */

var IZVODJACI = [
  {
    id: 'dj-maks',
    ime: 'DJ Maks',
    tip: 'DJ',
    zanr: 'House · Disco · Funk',
    opis: 'Rezident vikend-programa. Setovi koji kreću lagano uz kavu i koktele, a završe s punim šankom i plesom.',
    foto: '',
    instagram: ''
  },
  {
    id: 'dj-lorena',
    ime: 'DJ Lorena',
    tip: 'DJ',
    zanr: 'R&B · Hip-hop · Pop remixi',
    opis: 'Donosi urbani zvuk u Hedonist — poznata po prijelazima koje nitko ne primijeti dok cijeli kafić ne zapjeva.',
    foto: '',
    instagram: ''
  },
  {
    id: 'akusticni-duo-vinil',
    ime: 'Akustični duo Vinil',
    tip: 'Akustika',
    zanr: 'Pop-rock klasici · Domaće balade',
    opis: 'Gitara i vokal, bez struje i bez žurbe. Njihove verzije domaćih klasika redovito produže večer za sat-dva.',
    foto: '',
    instagram: ''
  },
  {
    id: 'ivan-gitara',
    ime: 'Ivan — gitara i vokal',
    tip: 'Akustika',
    zanr: 'Singer-songwriter · Rock balade',
    opis: 'Jedan čovjek, jedna gitara i repertoar od tri desetljeća. Svirke uz koje se naruči još jedna runda.',
    foto: '',
    instagram: ''
  },
  {
    id: 'dj-tin',
    ime: 'DJ Tin',
    tip: 'DJ',
    zanr: 'Tech-house · Melodic techno',
    opis: 'Za večeri kad Hedonist ide korak dublje u noć. Njegovi setovi grade atmosferu polako i ne puštaju je.',
    foto: '',
    instagram: ''
  }
];

var RASPORED = [
  /* ---- tekući tjedan ---- */
  { datum: '2026-07-10', vrijeme: '21:00', izvodjac: 'dj-maks' },
  { datum: '2026-07-11', vrijeme: '21:00', izvodjac: 'akusticni-duo-vinil' },

  /* ---- sljedeći tjedan (prikaže se automatski kad tjedan počne) ---- */
  { datum: '2026-07-17', vrijeme: '21:00', izvodjac: 'dj-lorena' },
  { datum: '2026-07-18', vrijeme: '21:00', izvodjac: 'dj-tin' }
];

/* =====================================================================
   Ispod je kod koji crta stranicu — NIJE potrebno dirati.
===================================================================== */
(function(){
  var gigList = document.getElementById('gig-list');
  var artistGrid = document.getElementById('artist-grid');
  if (!gigList && !artistGrid) return;

  var DANI = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
  var MJESECI = ['sij', 'velj', 'ožu', 'tra', 'svi', 'lip', 'srp', 'kol', 'ruj', 'lis', 'stu', 'pro'];

  var byId = {};
  IZVODJACI.forEach(function(a){ byId[a.id] = a; });

  function initials(name){
    var parts = name.replace(/^DJ\s+/i, '').split(/[\s—-]+/).filter(Boolean);
    var out = parts[0] ? parts[0][0] : '?';
    if (parts[1]) out += parts[1][0];
    return out.toUpperCase();
  }

  function avatarHTML(artist, cls){
    if (artist.foto) {
      return '<img class="' + cls + '" src="' + artist.foto + '" alt="' + artist.ime + '" loading="lazy" ' +
        'onerror="this.outerHTML=\'<span class=&quot;' + cls + ' artist-avatar&quot;>' + initials(artist.ime) + '</span>\'">';
    }
    return '<span class="' + cls + ' artist-avatar" aria-hidden="true">' + initials(artist.ime) + '</span>';
  }

  /* ---- Ovaj tjedan ---- */
  if (gigList) {
    var now = new Date();
    var todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    var monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0,0,0,0);
    var sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);

    var thisWeek = RASPORED.filter(function(r){
      var d = new Date(r.datum + 'T12:00:00');
      return d >= monday && d <= sunday && byId[r.izvodjac];
    }).sort(function(a,b){ return a.datum === b.datum ? (a.vrijeme < b.vrijeme ? -1 : 1) : (a.datum < b.datum ? -1 : 1); });

    if (!thisWeek.length) {
      gigList.innerHTML = '<p class="gig-empty">Ovaj tjedan nema najavljenih svirki — raspored za vikend objavljujemo na ' +
        '<a href="https://www.instagram.com/hedonistbarosijek/" target="_blank" rel="noopener">Instagramu</a>.</p>';
    } else {
      gigList.innerHTML = thisWeek.map(function(r){
        var a = byId[r.izvodjac];
        var d = new Date(r.datum + 'T12:00:00');
        var isTonight = r.datum === todayStr;
        var isPast = r.datum < todayStr;
        return '' +
          '<article class="gig-card' + (isTonight ? ' is-tonight' : '') + (isPast ? ' is-past' : '') + '">' +
            '<div class="gig-date" aria-hidden="true">' +
              '<span class="gig-date-day">' + d.getDate() + '</span>' +
              '<span class="gig-date-month">' + MJESECI[d.getMonth()] + '</span>' +
            '</div>' +
            avatarHTML(a, 'gig-photo') +
            '<div class="gig-info">' +
              '<p class="gig-when">' + DANI[d.getDay()] + ' · ' + r.vrijeme + ' h' +
                (isTonight ? '<span class="gig-tonight-chip">Večeras</span>' : '') +
                (isPast ? '<span class="gig-past-chip">Odsvirano</span>' : '') +
              '</p>' +
              '<h3 class="gig-name">' + a.ime + '</h3>' +
              '<p class="gig-genre">' + a.zanr + '</p>' +
            '</div>' +
          '</article>';
      }).join('');
    }
  }

  /* ---- Izvođači ---- */
  if (artistGrid) {
    artistGrid.innerHTML = IZVODJACI.map(function(a){
      return '' +
        '<article class="artist-card">' +
          avatarHTML(a, 'artist-photo') +
          '<h3 class="artist-name">' + a.ime + '</h3>' +
          '<span class="artist-type">' + a.tip + '</span>' +
          '<p class="artist-genre">' + a.zanr + '</p>' +
          '<p class="artist-bio">' + a.opis + '</p>' +
          (a.instagram ? '<a class="artist-ig" href="' + a.instagram + '" target="_blank" rel="noopener">Instagram</a>' : '') +
        '</article>';
    }).join('');
  }
})();
