/* =====================================================================
   Dan / noć prekidač (početna, sekcija #dan) — sav vizualni prijelaz
   (fotografije, panel s tekstom, položaj klizača) vodi se preko jednog
   [data-mode] atributa na sekciji (vidi styles.css). Ovdje se samo:
   - sinkroniziraju aria-atributi s tim stanjem,
   - pamti ručni odabir posjetitelja (localStorage), inače ostaje
     početno stanje koje je inline skripta u HTML-u već postavila
     prema stvarnom lokalnom vremenu (prije prvog crtanja),
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

  /* uskladi aria stanje s onim što je inline bootstrap skripta već postavila */
  applyAria(section.getAttribute('data-mode') === 'night' ? 'night' : 'day');

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
