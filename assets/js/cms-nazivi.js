/* Nazivi stranica — dinamički učitaj i primijeni sve nazive, naslove, meta opise
   Koristi /api/nazivi CMS, fallback na hardkodirane vrijednosti ako API ne radi */

(function(){
  var FALLBACK_NAZIVI = {};

  fetch('/api/nazivi')
    .then(function(r){ if (!r.ok) throw new Error('api'); return r.json(); })
    .then(function(data){
      if (!data || typeof data !== 'object') return;
      applyNazivi(data);
    })
    .catch(function(){
      /* ako API zataji, koristi fallback — obavezno je hardkodirati u <head> kao prije */
    });

  function applyNazivi(nazivi){
    /* <title> tag — index.title, cjenik.title, itd. */
    var titleKey = getTitleKey();
    if (titleKey && nazivi[titleKey]) {
      document.title = nazivi[titleKey];
    }

    /* <meta name="description"> */
    var metaDescKey = titleKey ? titleKey + '-meta-desc' : null;
    if (metaDescKey && nazivi[metaDescKey]) {
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', nazivi[metaDescKey]);
    }

    /* <meta property="og:title"> i og:description */
    if (titleKey && nazivi[titleKey]) {
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', nazivi[titleKey]);
    }
    if (metaDescKey && nazivi[metaDescKey]) {
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', nazivi[metaDescKey]);
    }

    /* nav linkovi */
    applyNavText(nazivi);
  }

  function getTitleKey(){
    var path = window.location.pathname;
    if (path.includes('cjenik')) return 'cjenik.title';
    if (path.includes('zaposlenje')) return 'zaposlenje.title';
    if (path.includes('lokacija')) return 'lokacija.title';
    if (path.includes('privatnost')) return 'privatnost.title';
    return 'index.title';
  }

  function applyNavText(nazivi){
    var nav = document.querySelector('.nav-links');
    if (!nav) return;
    var links = nav.querySelectorAll('a');
    links.forEach(function(link){
      var href = link.getAttribute('href');
      if (href && href.includes('zaposlenje')) {
        if (nazivi['nav.zaposlenje']) link.textContent = nazivi['nav.zaposlenje'];
      } else if (href && href.includes('lokacija')) {
        if (nazivi['nav.lokacija']) link.textContent = nazivi['nav.lokacija'];
      }
    });

    /* također u mobilnoj navigaciji */
    var mobileNav = document.querySelector('.mobile-nav');
    if (!mobileNav) return;
    var mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(function(link){
      var href = link.getAttribute('href');
      if (href && href.includes('zaposlenje')) {
        if (nazivi['nav.zaposlenje']) link.textContent = nazivi['nav.zaposlenje'];
      } else if (href && href.includes('lokacija')) {
        if (nazivi['nav.lokacija']) link.textContent = nazivi['nav.lokacija'];
      }
    });
  }
})();
