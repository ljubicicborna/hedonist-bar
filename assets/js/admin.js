/* =====================================================================
   ADMIN — uređivanje sadržaja (/admin.html), PRIJENOSNA verzija.
   ---------------------------------------------------------------------
   Sprema izmjene preko save.php (radi na svakom PHP hostingu). Ako hosting
   NEMA PHP (npr. GitHub Pages), automatski se prebaci na "način izvoza":
   uređuješ normalno, a spremanje preuzme gotove data/*.json datoteke koje
   onda uploadaš na hosting. Ništa ne ovisi o jednom konkretnom serveru —
   sve putuje s projektom.

   Javne stranice čitaju iz data/cjenik.json, data/tekstovi.json,
   data/dogadjaji.json (vidi assets/js/*.js).
===================================================================== */
(function(){
  var SAVE = 'save.php';
  var VRSTE = ['cjenik', 'tekstovi', 'dogadjaji'];

  var saveMode = 'export';       /* 'php' (izravno spremanje) ili 'export' (preuzimanje) */
  var adminPassword = '';

  var state = { cjenik: null, tekstovi: null, dogadjaji: null };
  var dirty = { cjenik: false, tekstovi: false, dogadjaji: false };

  var loginView = document.getElementById('login-view');
  var appView = document.getElementById('app-view');
  var catsEl = document.getElementById('cjenik-cats');
  var dogadjajiEl = document.getElementById('dogadjaji');
  var saveBtn = document.getElementById('save');
  var statusEl = document.getElementById('save-status');

  var TEKST_POLJA = {
    cjenik: [
      ['cjenik.uvod', 'Uvodni tekst na vrhu stranice', 'textarea']
    ],
    pocetna: [
      ['pocetna.filozofija-citat', 'Citat (sekcija Misija – vizija)', 'input'],
      ['pocetna.filozofija', 'Tekst — Misija – vizija', 'textarea'],
      ['pocetna.cjenik-napomena', 'Tekst — Katalog', 'textarea'],
      ['pocetna.podanu', 'Tekst — Po danu', 'textarea'],
      ['pocetna.atmosfera', 'Tekst — Atmosfera', 'textarea']
    ],
    zaposlenje: [
      ['zaposlenje.uvod', 'Uvodni tekst na vrhu stranice', 'textarea'],
      ['zaposlenje.napomena', 'Napomena ispod obrasca', 'textarea']
    ]
  };

  var PAGE_URLS = { cjenik: 'cjenik.html', pocetna: 'index.html', zaposlenje: 'zaposlenje.html' };

  function esc(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function setStatus(text, cls){
    statusEl.textContent = text;
    statusEl.className = 'save-status' + (cls ? ' ' + cls : '');
  }
  function anyDirty(){ return dirty.cjenik || dirty.tekstovi || dirty.dogadjaji; }
  function markDirty(vrsta){
    dirty[vrsta] = true;
    saveBtn.disabled = false;
    setStatus('Imaš nespremljene promjene', 'is-dirty');
  }

  /* ================= BIRAČ STRANICE ================= */
  var pagePick = document.getElementById('page-pick');
  var viewLink = document.getElementById('view-link');
  function showPanel(){
    var page = pagePick.value;
    ['cjenik', 'pocetna', 'zaposlenje'].forEach(function(p){
      var el = document.getElementById('panel-' + p);
      if (el) el.hidden = p !== page;
    });
    if (viewLink) viewLink.href = PAGE_URLS[page] || 'index.html';
  }
  pagePick.addEventListener('change', showPanel);

  /* ================= TEKSTOVI ================= */
  function renderTexts(){
    document.querySelectorAll('.text-fields').forEach(function(box){
      var page = box.getAttribute('data-texts');
      if (!TEKST_POLJA[page]) return;
      box.innerHTML = TEKST_POLJA[page].map(function(f){
        var val = esc(state.tekstovi[f[0]] || '');
        var field = f[2] === 'input'
          ? '<input data-tkey="' + f[0] + '" value="' + val + '">'
          : '<textarea data-tkey="' + f[0] + '">' + val + '</textarea>';
        return '<div class="field"><label>' + esc(f[1]) + '</label>' + field + '</div>';
      }).join('');
    });
  }
  document.addEventListener('input', function(e){
    var k = e.target.getAttribute && e.target.getAttribute('data-tkey');
    if (!k) return;
    state.tekstovi[k] = e.target.value;
    markDirty('tekstovi');
  });

  /* ================= DOGAĐAJI (sekcija "Novosti" na početnoj) ================= */
  function renderDogadjaji(){
    dogadjajiEl.innerHTML = state.dogadjaji.dogadjaji.map(function(d, i){
      return '<article class="oglas-card' + (d.aktivno ? '' : ' is-inactive') + '" data-i="' + i + '">' +
        '<div class="field-grid">' +
          '<div class="field"><label>Dan</label><input data-f="dan" value="' + esc(d.dan) + '" placeholder="npr. Petak"></div>' +
          '<div class="field"><label>Naziv</label><input data-f="naziv" value="' + esc(d.naziv) + '" placeholder="npr. Music Night"></div>' +
          '<div class="field field-wide"><label>Opis (podnaslov)</label><input data-f="opis" value="' + esc(d.opis) + '" placeholder="npr. Ex-Yu glazba cijelu večer"></div>' +
        '</div>' +
        '<label class="oglas-active"><input type="checkbox" data-f="aktivno"' + (d.aktivno ? ' checked' : '') + '> Aktivno (prikazano na početnoj)</label>' +
        '<button type="button" class="artist-del" data-del-dogadjaj="' + i + '">Obriši događaj</button>' +
      '</article>';
    }).join('') || '<p class="hint">Nema događaja — dodaj prvi gumbom ispod.</p>';
  }
  dogadjajiEl.addEventListener('input', function(e){
    var card = e.target.closest('.oglas-card');
    var f = e.target.getAttribute && e.target.getAttribute('data-f');
    if (!card || !f) return;
    var d = state.dogadjaji.dogadjaji[Number(card.getAttribute('data-i'))];
    d[f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (f === 'aktivno') card.classList.toggle('is-inactive', !d.aktivno);
    markDirty('dogadjaji');
  });
  dogadjajiEl.addEventListener('click', function(e){
    var del = e.target.closest('[data-del-dogadjaj]');
    if (!del) return;
    var i = Number(del.getAttribute('data-del-dogadjaj'));
    if (!confirm('Obrisati događaj "' + (state.dogadjaji.dogadjaji[i].naziv || 'bez naziva') + '"?')) return;
    state.dogadjaji.dogadjaji.splice(i, 1);
    markDirty('dogadjaji');
    renderDogadjaji();
  });
  document.getElementById('add-dogadjaj').addEventListener('click', function(){
    state.dogadjaji.dogadjaji.push({ id: 'dogadjaj-' + Date.now(), dan: '', naziv: '', opis: '', aktivno: true });
    markDirty('dogadjaji');
    renderDogadjaji();
    var cards = dogadjajiEl.querySelectorAll('.oglas-card');
    if (cards.length) {
      cards[cards.length - 1].scrollIntoView({ block: 'center' });
      var first = cards[cards.length - 1].querySelector('input[data-f="dan"]');
      if (first) first.focus();
    }
  });

  /* ================= KATALOG (cjenik) ================= */
  var IKONE = [
    ['', 'bez ikone'], ['coffee', 'kava'], ['juice', 'sok'], ['beer', 'pivo'],
    ['cider', 'cider'], ['wine', 'vino'], ['spirit', 'žestica'],
    ['cocktail', 'koktel'], ['cigarette', 'cigarete'], ['cigar', 'cigare']
  ];
  function catCount(c){
    var n = c.grupe.reduce(function(m, g){ return m + g.stavke.length; }, 0);
    return n + (n === 1 ? ' stavka' : (n >= 2 && n <= 4 ? ' stavke' : ' stavki'));
  }
  function renderCjenik(openIndex){
    catsEl.innerHTML = state.cjenik.kategorije.map(function(c, ci){
      var groups = c.grupe.map(function(g, gi){
        var ikonaOpts = IKONE.map(function(o){
          return '<option value="' + o[0] + '"' + (o[0] === g.ikona ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('');
        var items = g.stavke.map(function(s, si){
          return '<div class="itm" data-it="' + si + '">' +
            '<input data-if="naziv" value="' + esc(s.naziv) + '" placeholder="Naziv pića">' +
            '<input data-if="opis" value="' + esc(s.opis) + '" placeholder="Sastojci / napomena (nije obavezno)">' +
            '<button type="button" class="row-x itm-del" aria-label="Obriši stavku">✕</button>' +
          '</div>';
        }).join('');
        return '<div class="grp" data-g="' + gi + '">' +
          '<div class="grp-head">' +
            '<input data-gf="naziv" value="' + esc(g.naziv) + '" placeholder="Naziv grupe (npr. Kave)">' +
            '<select data-gf="ikona">' + ikonaOpts + '</select>' +
            '<button type="button" class="row-x grp-del" aria-label="Obriši grupu">✕</button>' +
          '</div>' +
          '<div class="itms">' + items + '</div>' +
          '<button type="button" class="btn-mini itm-add">+ stavka</button>' +
        '</div>';
      }).join('');
      return '<details class="cat" data-c="' + ci + '"' + (ci === openIndex ? ' open' : '') + '>' +
        '<summary><span class="cat-sum-name">' + esc(c.naziv || 'Nova kategorija') + '</span>' +
        '<span class="cat-sum-count">' + catCount(c) + '</span></summary>' +
        '<div class="cat-body">' +
          '<div class="field"><label>Naziv kategorije</label><input data-cf="naziv" value="' + esc(c.naziv) + '"></div>' +
          groups +
          '<div class="cat-actions">' +
            '<button type="button" class="btn-mini grp-add">+ Dodaj grupu</button>' +
            '<button type="button" class="cat-del">Obriši kategoriju</button>' +
          '</div>' +
        '</div>' +
      '</details>';
    }).join('') || '<p class="hint">Nema kategorija — dodaj prvu gumbom ispod.</p>';
  }
  function cjenikCtx(el){
    var cat = el.closest('.cat');
    var ci = Number(cat.getAttribute('data-c'));
    var grpEl = el.closest('.grp');
    var gi = grpEl ? Number(grpEl.getAttribute('data-g')) : -1;
    var itmEl = el.closest('.itm');
    var si = itmEl ? Number(itmEl.getAttribute('data-it')) : -1;
    return { c: state.cjenik.kategorije[ci], ci: ci, gi: gi, si: si, catEl: cat };
  }
  catsEl.addEventListener('input', function(e){
    var t = e.target;
    if (!t.closest('.cat')) return;
    var ctx = cjenikCtx(t);
    if (t.hasAttribute('data-cf')) {
      ctx.c.naziv = t.value;
      ctx.catEl.querySelector('.cat-sum-name').textContent = t.value || 'Nova kategorija';
    } else if (t.hasAttribute('data-gf')) {
      ctx.c.grupe[ctx.gi][t.getAttribute('data-gf')] = t.value;
    } else if (t.hasAttribute('data-if')) {
      ctx.c.grupe[ctx.gi].stavke[ctx.si][t.getAttribute('data-if')] = t.value;
    } else { return; }
    markDirty('cjenik');
  });
  catsEl.addEventListener('click', function(e){
    var t = e.target;
    if (t.closest('.itm-del')) {
      var ctx = cjenikCtx(t);
      ctx.c.grupe[ctx.gi].stavke.splice(ctx.si, 1);
      markDirty('cjenik');
      renderCjenik(ctx.ci);
    } else if (t.closest('.itm-add')) {
      var ctx2 = cjenikCtx(t);
      ctx2.c.grupe[ctx2.gi].stavke.push({ naziv: '', opis: '' });
      markDirty('cjenik');
      renderCjenik(ctx2.ci);
      var grp = catsEl.querySelector('.cat[data-c="' + ctx2.ci + '"] .grp[data-g="' + ctx2.gi + '"]');
      var last = grp && grp.querySelector('.itm:last-child input[data-if="naziv"]');
      if (last) { last.focus(); last.scrollIntoView({ block: 'center' }); }
    } else if (t.closest('.grp-del')) {
      var ctx3 = cjenikCtx(t);
      var g = ctx3.c.grupe[ctx3.gi];
      if (g.stavke.length && !confirm('Obrisati grupu "' + (g.naziv || 'bez naziva') + '" i njenih ' + g.stavke.length + ' stavki?')) return;
      ctx3.c.grupe.splice(ctx3.gi, 1);
      markDirty('cjenik');
      renderCjenik(ctx3.ci);
    } else if (t.closest('.grp-add')) {
      var ctx4 = cjenikCtx(t);
      ctx4.c.grupe.push({ naziv: '', ikona: '', stavke: [] });
      markDirty('cjenik');
      renderCjenik(ctx4.ci);
    } else if (t.closest('.cat-del')) {
      var ctx5 = cjenikCtx(t);
      var total = ctx5.c.grupe.reduce(function(m, gr){ return m + gr.stavke.length; }, 0);
      if (!confirm('Obrisati kategoriju "' + (ctx5.c.naziv || 'bez naziva') + '"' + (total ? ' i njenih ' + total + ' stavki' : '') + '?')) return;
      state.cjenik.kategorije.splice(ctx5.ci, 1);
      markDirty('cjenik');
      renderCjenik(-1);
    }
  });
  document.getElementById('add-cat').addEventListener('click', function(){
    state.cjenik.kategorije.push({ id: 'kat-' + Date.now(), naziv: '', grupe: [{ naziv: '', ikona: '', stavke: [] }] });
    markDirty('cjenik');
    renderCjenik(state.cjenik.kategorije.length - 1);
    var inp = catsEl.querySelector('.cat[open] input[data-cf="naziv"]');
    if (inp) { inp.focus(); inp.scrollIntoView({ block: 'center' }); }
  });

  /* ================= VALIDACIJA + ČIŠĆENJE ================= */
  function validateBeforeSave(){
    if (dirty.dogadjaji && state.dogadjaji.dogadjaji.some(function(d){ return !String(d.naziv).trim(); })) {
      return 'Svaki događaj mora imati naziv.';
    }
    if (dirty.cjenik) {
      for (var i = 0; i < state.cjenik.kategorije.length; i++) {
        var c = state.cjenik.kategorije[i];
        if (!String(c.naziv).trim()) return 'Svaka kategorija kataloga mora imati naziv.';
        for (var j = 0; j < c.grupe.length; j++) {
          for (var k = 0; k < c.grupe[j].stavke.length; k++) {
            if (!String(c.grupe[j].stavke[k].naziv).trim()) return 'U kategoriji "' + c.naziv + '" postoji stavka bez naziva.';
          }
        }
      }
    }
    return null;
  }
  function cleanData(vrsta){
    if (vrsta === 'cjenik') {
      return { kategorije: state.cjenik.kategorije.map(function(c){
        return { id: String(c.id || ('kat-' + Date.now())), naziv: String(c.naziv).trim(),
          grupe: c.grupe.map(function(g){
            return { naziv: String(g.naziv || '').trim(), ikona: String(g.ikona || '').trim(),
              stavke: g.stavke.map(function(s){ return { naziv: String(s.naziv).trim(), opis: String(s.opis || '').trim() }; }) };
          }) };
      }) };
    }
    if (vrsta === 'dogadjaji') {
      return { dogadjaji: state.dogadjaji.dogadjaji.map(function(d){
        return { id: String(d.id || ('dogadjaj-' + Date.now())), dan: String(d.dan || '').trim(),
          naziv: String(d.naziv || '').trim(), opis: String(d.opis || '').trim(), aktivno: !!d.aktivno };
      }) };
    }
    /* tekstovi */
    var out = {};
    Object.keys(state.tekstovi).forEach(function(k){ out[k] = String(state.tekstovi[k]).trim(); });
    return out;
  }

  /* ================= SPREMANJE ================= */
  function download(filename, text){
    var blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  }

  saveBtn.addEventListener('click', function(){
    var err = validateBeforeSave();
    if (err) { alert(err); return; }
    var queue = VRSTE.filter(function(v){ return dirty[v]; });
    if (!queue.length) return;

    saveBtn.disabled = true;
    setStatus('Spremam…');

    if (saveMode === 'export') {
      /* hosting bez PHP-a: preuzmi datoteke, uputa za upload */
      queue.forEach(function(vrsta){
        download('data__' + vrsta + '.json', JSON.stringify(cleanData(vrsta), null, 2) + '\n');
        dirty[vrsta] = false;
      });
      setStatus('Preuzeto ' + queue.length + ' datoteka. Preimenuj svaku u <ime>.json bez "data__" i uploadaj u mapu data/ na hostingu.', 'is-ok');
      alert('Hosting nema PHP, pa su izmjene preuzete kao datoteke.\n\nZa svaku preuzetu datoteku:\n1. preimenuj "data__cjenik.json" → "cjenik.json" (makni "data__")\n2. uploadaj je u mapu data/ na hostingu (zamijeni postojeću).\n\nStranica se osvježi čim datoteke zamijeniš.');
      return;
    }

    /* PHP hosting: spremi izravno */
    var chain = Promise.resolve();
    var failed = null;
    queue.forEach(function(vrsta){
      chain = chain.then(function(){
        if (failed) return;
        return fetch(SAVE, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save', vrsta: vrsta, data: cleanData(vrsta), password: adminPassword }) })
          .then(function(r){ return r.text().then(function(txt){ var j; try { j = JSON.parse(txt); } catch(e) { j = null; }
            if (r.ok && j && j.ok) { dirty[vrsta] = false; }
            else { failed = (j && j.error) || 'Greška pri spremanju.'; } }); });
      });
    });
    chain.then(function(){
      if (failed) { saveBtn.disabled = false; setStatus(failed, 'is-err'); }
      else { setStatus('Spremljeno ✓ (osvježi stranicu da vidiš promjene)', 'is-ok'); }
    }).catch(function(){
      saveBtn.disabled = false;
      setStatus('Nema veze s poslužiteljem — pokušaj ponovno.', 'is-err');
    });
  });

  window.addEventListener('beforeunload', function(e){
    if (anyDirty()) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ================= UČITAVANJE ================= */
  function getJSON(url, fallback){
    return fetch(url + (url.indexOf('?') === -1 ? '?' : '&') + 't=' + Date.now(), { cache: 'no-store' })
      .then(function(r){ if (!r.ok) throw 0; return r.json(); })
      .catch(function(){ return fallback; });
  }
  function loadAndShow(){
    return Promise.all([
      getJSON('data/cjenik.json', { kategorije: [] }),
      getJSON('data/tekstovi.json', {}),
      getJSON('data/dogadjaji.json', { dogadjaji: [] })
    ]).then(function(res){
      state.cjenik = { kategorije: (res[0] && res[0].kategorije) || [] };
      state.tekstovi = (res[1] && typeof res[1] === 'object') ? res[1] : {};
      state.dogadjaji = { dogadjaji: (res[2] && res[2].dogadjaji) || [] };
      renderCjenik(-1);
      renderTexts();
      renderDogadjaji();
      showPanel();
      loginView.hidden = true;
      appView.hidden = false;
      setStatus(saveMode === 'export'
        ? 'Način izvoza (hosting bez PHP-a): spremanje preuzima datoteke za upload.'
        : '');
      saveBtn.disabled = true;
    });
  }

  /* ================= PRIJAVA ================= */
  document.getElementById('logout').addEventListener('click', function(){
    if (anyDirty() && !confirm('Imaš nespremljene promjene — svejedno se odjaviti?')) return;
    dirty = { cjenik: false, tekstovi: false, dogadjaji: false };
    adminPassword = '';
    location.reload();
  });

  var loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    var pass = document.getElementById('login-pass').value;
    var errEl = document.getElementById('login-err');
    errEl.hidden = true;
    setStatus('');

    fetch(SAVE, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password: pass }) })
      .then(function(r){ return r.text().then(function(txt){ var j; try { j = JSON.parse(txt); } catch(e) { j = null; }
        return { status: r.status, json: j }; }); })
      .then(function(res){
        if (res.json && res.json.ok) {
          /* PHP radi i lozinka je točna → izravno spremanje */
          saveMode = 'php';
          adminPassword = pass;
          return loadAndShow();
        }
        if (res.json && res.status === 401) {
          /* PHP radi, kriva lozinka */
          errEl.textContent = 'Pogrešna lozinka, pokušaj ponovno.';
          errEl.hidden = false;
          return;
        }
        /* nema PHP-a (statični hosting) → način izvoza */
        saveMode = 'export';
        adminPassword = '';
        return loadAndShow();
      })
      .catch(function(){
        /* mrežna greška / nema save.php → način izvoza */
        saveMode = 'export';
        adminPassword = '';
        loadAndShow();
      });
  });

  loginView.hidden = false;
})();
