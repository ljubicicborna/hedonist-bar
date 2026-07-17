/* =====================================================================
   Dan / noć prekidač (početna, sekcija #dan) — sav vizualni prijelaz
   (fotografije, panel s tekstom, položaj klizača) vodi se preko jednog
   [data-mode] atributa na sekciji (vidi styles.css). Ova skripta:
   - postavi početno stanje prema zapamćenom odabiru (localStorage),
     inače prema stvarnom lokalnom vremenu (7–19 h = dan). To MORA biti
     ovdje, u vanjskoj datoteci: produkcijski CSP (vercel.json) nema
     'unsafe-inline' za skripte, pa se inline <script> u HTML-u na
     produkciji uopće ne izvrši — lokalno radi, live šuti. Sekcija je
     duboko ispod prvog ekrana, pa izvršavanje na kraju body-ja stigne
     davno prije nego što je posjetitelj može vidjeti.
   - drži aria-atribute u skladu s [data-mode],
   - omogući prebacivanje klikom, povlačenjem/swipeom i tipkovnicom.
===================================================================== */
(function(){
  var section = document.getElementById('dan');
  if (!section || !section.classList.contains('daytime')) return;

  var buttons = section.querySelectorAll('.daynight-btn');
  var track = section.querySelector('.daynight-track');
  var STORAGE_KEY = 'hedonistDayNight';

  function applyAria(mode){
    buttons.forEach(function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-mode') === mode ? 'true' : 'false');
    });
    if (track) track.setAttribute('aria-checked', mode === 'night' ? 'true' : 'false');
  }

  function setMode(mode){
    section.setAttribute('data-mode', mode);
    applyAria(mode);
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) { /* privatno pregledavanje i sl. */ }
  }

  /* početno stanje: zapamćeni odabir ako postoji, inače po satu */
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  var hour = new Date().getHours();
  var initial = (saved === 'day' || saved === 'night') ? saved : ((hour >= 7 && hour < 19) ? 'day' : 'night');
  section.setAttribute('data-mode', initial);
  applyAria(initial);

  buttons.forEach(function(b){
    b.addEventListener('click', function(){ setMode(b.getAttribute('data-mode')); });
  });

  if (!track) return;

  var dragging = false, startX = 0, moved = false;

  function pointerX(e){ return e.touches ? e.touches[0].clientX : e.clientX; }

  function onMove(e){
    if (!dragging) return;
    if (Math.abs(pointerX(e) - startX) > 8) moved = true;
  }
  function onUp(e){
    if (!dragging) return;
    dragging = false;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('touchend', onUp);
    var endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    var dx = endX - startX;
    if (!moved) {
      setMode(section.getAttribute('data-mode') === 'day' ? 'night' : 'day');
      return;
    }
    setMode(dx > 0 ? 'night' : 'day');
  }
  function onDown(e){
    dragging = true; moved = false; startX = pointerX(e);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  }

  track.addEventListener('mousedown', onDown);
  track.addEventListener('touchstart', onDown, { passive: true });

  track.addEventListener('keydown', function(e){
    if (e.key === 'ArrowLeft') setMode('day');
    else if (e.key === 'ArrowRight') setMode('night');
    else if (e.key === ' ' || e.key === 'Enter') setMode(section.getAttribute('data-mode') === 'day' ? 'night' : 'day');
    else return;
    e.preventDefault();
  });
})();
