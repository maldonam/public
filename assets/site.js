/* Cashy Oversight Challenge - small site script.
   1. Mobile nav toggle.
   2. Charts rendered as inline SVG from summary statistics precomputed from
      data/S8.synthetic_cashy_sample.csv (see README for the script). */

(function () {
  // --- Mobile nav ---------------------------------------------------------
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // --- Summary statistics (computed from the synthetic sample) -----------
  var STATS = {
    month: {
      labels: ['2023-06','2023-07','2023-08','2023-09','2023-10','2023-11','2023-12','2024-01','2024-02','2024-03','2024-04','2024-05','2024-06','2024-07'],
      all:    [84,160,166,121,138,112,101,172,175,134,174,187,146,30],
      incl:   [3,7,48,29,44,41,44,68,54,41,20,23,4,1]
    },
    vuln: {
      labels: ['Baja','Moderada','Elevada','Severa'],
      all: [775,394,612,119]
    },
    elig: {
      labels: ['No Elegible','Lista de Reserva','Elegible','No Elegible por Intenciones','No Elegible por Duplicidad','Elegible por Proceso Acelerado'],
      all: [932,451,414,52,38,13],
      incl: [false,false,true,false,false,true]
    },
    score: {
      labels: ['0','5','10','15','20','25','30','35','40','45','50','55','60','65','70','75','80'],
      all:  [103,154,164,159,200,277,268,180,153,97,64,44,18,14,1,3,1],
      incl: [28,21,27,39,47,58,69,41,42,25,14,9,3,3,0,1,0]
    },
    office: {
      labels: ['sotap','fupal','foten','pcr_cdmx','futij','fomon','(blank)','fusal'],
      all: [1278,190,186,127,47,36,21,15],
      rate: [22.1,22.6,25.8,24.4,17.0,22.2,14.3,20.0]
    }
  };

  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function fmt(n) { return n.toLocaleString('en-US'); }
  function niceMax(v) {
    var p = Math.pow(10, Math.floor(Math.log10(v)));
    var m = v / p;
    var steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10], s = 10;
    for (var i = 0; i < steps.length; i++) { if (m <= steps[i]) { s = steps[i]; break; } }
    return s * p;
  }

  // Vertical bars, optional stacked "highlight" subset drawn over the base bar.
  function verticalBars(host, d, opts) {
    var W = opts.width || 600, H = opts.height || 220, padL = 44, padR = 8, padT = 12, padB = 40;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opts.label });
    var iw = W - padL - padR, ih = H - padT - padB;
    var max = niceMax(Math.max.apply(null, d.all));
    var n = d.all.length, gap = 4, bw = (iw - gap * (n - 1)) / n;
    var ticks = 4;
    for (var t = 0; t <= ticks; t++) {
      var y = padT + ih - (ih * t / ticks);
      svg.appendChild(el('line', { x1: padL, x2: W - padR, y1: y, y2: y, 'class': t === 0 ? 'axis' : 'grid' }));
      svg.appendChild(el('text', { x: padL - 6, y: y + 4, 'text-anchor': 'end' }, fmt(max * t / ticks)));
    }
    d.all.forEach(function (v, i) {
      var x = padL + i * (bw + gap), h = ih * v / max, y = padT + ih - h;
      var r = el('rect', { x: x, y: y, width: bw, height: h, 'class': d.incl ? 'bar soft' : 'bar' });
      r.appendChild(el('title', {}, d.labels[i] + ': ' + fmt(v) + (d.incl ? ' households, ' + fmt(d.incl[i]) + ' INCLUSION' : '')));
      svg.appendChild(r);
      if (d.incl) {
        var h2 = ih * d.incl[i] / max;
        var r2 = el('rect', { x: x, y: padT + ih - h2, width: bw, height: h2, 'class': 'bar' });
        r2.appendChild(el('title', {}, d.labels[i] + ': ' + fmt(d.incl[i]) + ' INCLUSION of ' + fmt(v)));
        svg.appendChild(r2);
      }
      var every = opts.labelEvery || 1;
      if (i % every === 0) {
        svg.appendChild(el('text', { x: x + bw / 2, y: H - padB + 16, 'text-anchor': 'middle' }, opts.short ? opts.short(d.labels[i]) : d.labels[i]));
      }
    });
    if (opts.xTitle) svg.appendChild(el('text', { x: padL + iw / 2, y: H - 6, 'text-anchor': 'middle' }, opts.xTitle));
    host.appendChild(svg);
  }

  // Horizontal bars with value labels; optional secondary text per row.
  function horizontalBars(host, d, opts) {
    var W = 600, rowH = 26, padL = opts.padL || 150, padR = 70, padT = 4;
    var n = d.all.length, H = padT + n * rowH + 6;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opts.label });
    var iw = W - padL - padR;
    var max = Math.max.apply(null, d.all);
    d.all.forEach(function (v, i) {
      var y = padT + i * rowH, w = iw * v / max;
      svg.appendChild(el('text', { x: padL - 10, y: y + rowH / 2 + 4, 'text-anchor': 'end' }, d.labels[i]));
      var cls = (d.incl && d.incl[i]) ? 'bar' : (d.incl ? 'bar soft' : 'bar');
      var r = el('rect', { x: padL, y: y + 5, width: Math.max(w, 2), height: rowH - 10, 'class': cls });
      r.appendChild(el('title', {}, d.labels[i] + ': ' + fmt(v) + (d.rate ? ' households, ' + d.rate[i].toFixed(1) + '% INCLUSION' : '')));
      svg.appendChild(r);
      var label = fmt(v) + (d.rate ? '  (' + d.rate[i].toFixed(1) + '%)' : '');
      svg.appendChild(el('text', { x: padL + w + 8, y: y + rowH / 2 + 4, 'class': 'val' }, label));
    });
    host.appendChild(svg);
  }

  var hosts = document.querySelectorAll('[data-chart]');
  Array.prototype.forEach.call(hosts, function (host) {
    var kind = host.getAttribute('data-chart');
    if (kind === 'month') verticalBars(host, STATS.month, { label: 'Households assessed per month, with INCLUSION highlighted', width: 1100, height: 300, short: function (s) { return s.slice(2); } });
    if (kind === 'vuln') horizontalBars(host, STATS.vuln, { label: 'Households per vulnerability category', padL: 90 });
    if (kind === 'elig') horizontalBars(host, STATS.elig, { label: 'Households per eligibility status', padL: 200 });
    if (kind === 'score') verticalBars(host, STATS.score, { label: 'FinalScore distribution in 5-point bands', height: 220, labelEvery: 2, xTitle: 'FinalScore (lower edge of 5-point band)' });
    if (kind === 'office') horizontalBars(host, STATS.office, { label: 'Households per field office with inclusion rate', padL: 90 });
  });
})();
