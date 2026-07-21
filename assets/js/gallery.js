/* =====================================================================
   Galerija (galerija.html) — mreža pločica, svaka krije 2 fotke u
   okomitoj vrpci (.gallery-tile-strip) iza overflow:hidden okvira.
   Svaka pločica posebno, pri SVAKOJ izmjeni, nasumično bira sljedeću
   fotku (kod parova to je uvijek ta druga, ali kod duljih vrpci bi bio
   nasumičan izbor) i pomiče vrpcu na nju. Ritam (4.4 s drži, 0.6 s
   klizi ≈ 5 s ciklus) je isti za sve pločice — samo je taj ritam ono
   što drži prizor "skladnim" dok se svaka pločica giba neovisno i u
   svom vlastitom trenutku.

   Klik na pločicu otvara trenutno vidljivu fotku preko cijelog zaslona
   (lightbox) i pauzira izmjenu za sve pločice dok je lightbox otvoren;
   zatvaranjem (X, klik izvan fotke ili Esc) izmjena se nastavlja.
===================================================================== */
(function(){
  var grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function tileHTML(tile){
    var imgs = (tile.slike || []).filter(function(im){ return im && im.src; });
    if (!imgs.length) return '';
    return '<div class="gallery-tile"><div class="gallery-tile-strip">' +
      imgs.map(function(im, i){
        return '<img src="' + esc(im.src) + '" alt="' + esc(im.alt || '') + '"' +
          (i > 0 ? ' aria-hidden="true"' : '') + ' loading="lazy">';
      }).join('') +
      '</div></div>';
  }

  /* galerija se uređuje na /admin.html (spremljeno u data/galerija.json);
     ako se ne učita, ostaje statična galerija iz galerija.html */
  fetch('data/galerija.json')
    .then(function(r){ if (!r.ok) throw 0; return r.json(); })
    .then(function(d){
      if (d && Array.isArray(d.ploce) && d.ploce.length) {
        var html = d.ploce.map(tileHTML).join('');
        if (html) grid.innerHTML = html;
      }
    })
    .catch(function(){ /* rezerva: statična galerija */ })
    .then(init);

  function init(){
  var strips = document.querySelectorAll('.gallery-tile-strip');
  if (!strips.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOLD_MS = 4400;
  var SLIDE_MS = 600;
  var paused = false;
  var timers = [];

  strips.forEach(function(strip){ strip._current = 0; });

  function clearTimers(){
    timers.forEach(function(id){ clearTimeout(id); });
    timers = [];
  }

  function startCycle(strip){
    var frames = strip.children.length;
    if (frames < 2) return;

    function tick(){
      if (paused) return;
      var next;
      do { next = Math.floor(Math.random() * frames); } while (next === strip._current);
      strip._current = next;
      strip.style.transform = 'translateY(-' + (strip._current * 100 / frames) + '%)';
      timers.push(setTimeout(tick, HOLD_MS + SLIDE_MS));
    }

    timers.push(setTimeout(tick, Math.random() * HOLD_MS));
  }

  function pauseCycling(){
    paused = true;
    clearTimers();
  }

  function resumeCycling(){
    if (reduceMotion) return;
    paused = false;
    strips.forEach(startCycle);
  }

  if (!reduceMotion) strips.forEach(startCycle);

  /* ---- lightbox ---- */
  var overlay = document.getElementById('gallery-lightbox');
  if (!overlay) return;
  var lbImg = overlay.querySelector('.gallery-lightbox-img');
  var lbClose = overlay.querySelector('.gallery-lightbox-close');
  var lastFocused = null;

  function openLightbox(tile){
    var strip = tile.querySelector('.gallery-tile-strip');
    if (!strip) return;
    var imgs = strip.querySelectorAll('img');
    var shown = imgs[strip._current || 0] || imgs[0];
    if (!shown) return;

    lbImg.src = shown.currentSrc || shown.src;
    lbImg.alt = shown.alt || imgs[0].alt || '';

    pauseCycling();
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('gallery-lightbox-open');
    lbClose.focus();
  }

  function closeLightbox(){
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('gallery-lightbox-open');
    lbImg.src = '';
    resumeCycling();
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  document.querySelectorAll('.gallery-tile').forEach(function(tile){
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-label', 'Otvori fotografiju uvećano');
    tile.addEventListener('click', function(){ openLightbox(tile); });
    tile.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(tile); }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !overlay.hidden) closeLightbox();
  });
  }
})();
