/* =====================================================================
   NOVOSTI (početna) — aktivni oglasi za posao
   Petak/subota (Music Night, Party Night) su statični u index.html.
   Podaci o oglasima se uređuju na /admin.html, ova skripta ih dohvaća
   s /api/oglasi i puni #home-jobs kad ih ima.
===================================================================== */
(function(){
  var homeJobs = document.getElementById('home-jobs');
  if (!homeJobs) return;

  var esc = function(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };

  fetch('/api/oglasi')
    .then(function(r){ if (!r.ok) throw new Error('api'); return r.json(); })
    .then(function(data){
      var active = (data.pozicije || []).filter(function(p){ return p.aktivno; });
      if (!active.length) return;
      homeJobs.innerHTML = active.map(function(p){
        return '' +
          '<a class="home-job" href="zaposlenje.html#job-form">' +
            '<span class="home-job-badge">' + esc(p.vrsta || 'Posao') + '</span>' +
            '<h3 class="home-job-title">' + esc(p.naslov) + '</h3>' +
            (p.satnica ? '<span class="home-job-wage">' + esc(p.satnica) + ' €/h</span>' : '') +
            '<span class="home-job-cta">Prijavi se <span aria-hidden="true">→</span></span>' +
          '</a>';
      }).join('');
    })
    .catch(function(){ /* nema oglasa, sekcija ostaje kakva jest */ });
})();
