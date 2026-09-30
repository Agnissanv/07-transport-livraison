(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var D = window.RX, page = document.body.getAttribute('data-page');
  var fmt = function (n) { return Math.round(n).toLocaleString('fr-FR').replace(/[  ]/g, ' '); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var dur = function (m) { m = Math.round(m); var h = Math.floor(m / 60), r = m % 60; return h ? h + ' h' + (r ? ' ' + String(r).padStart(2, '0') : '') : m + ' min'; };
  var mem = {};
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return k in mem ? mem[k] : d; } },
    set: function (k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var C = {}; D.communes.forEach(function (c) { C[c[0]] = c; });
  var km = function (a, b) { var A = C[a], B = C[b]; return Math.max(1.5, Math.hypot(A[1] - B[1], A[2] - B[2]) * 1.3); };
  var pkgOf = function (id) { return D.pkgs.filter(function (p) { return p.id === id; })[0]; };
  function quote(from, to, pkgId, type) {
    var p = pkgOf(pkgId); if (!p || !p.v) return null;
    var k = km(from, to), vr = D.vrate[p.v], dt = D.dtypes[type];
    var price = Math.max(1500, Math.ceil(((vr.base + k * vr.km) * dt.mult) / 100) * 100);
    var t = type === 'programmee' ? null : dt.d[0] + dt.d[1] * k;
    return { price: price, km: k, veh: vr.name, t: t };
  }
  var delayTxt = function (q, type) { return q.t === null ? 'au créneau choisi' : dur(q.t * 0.8) + ' à ' + dur(q.t * 1.3); };

  var mb = $('.menu-btn'), nav = $('#nav');
  if (mb && nav) mb.addEventListener('click', function () { var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o ? 'true' : 'false'); });

  function validate(scope) {
    var ok = true;
    $$('[required]', scope).forEach(function (f) {
      var v = f.type === 'checkbox' ? f.checked : f.value.trim() !== '';
      if (v && f.type === 'email') v = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (v && f.type === 'tel') v = /^[+\d][\d\s().-]{7,}$/.test(f.value.trim());
      var e = $('[data-err-for="' + f.id + '"]', scope); if (e) e.classList.toggle('show', !v);
      f.setAttribute('aria-invalid', v ? 'false' : 'true');
      if (!v) ok = false;
    });
    var bad = $('[aria-invalid="true"]', scope); if (bad) bad.focus();
    return ok;
  }
  var nl = $('#newsletter');
  if (nl) nl.addEventListener('submit', function (e) { e.preventDefault(); if (!validate(nl)) return; nl.reset(); $('.okm', nl).classList.add('show'); });
  var cf = $('#cform');
  if (cf) cf.addEventListener('submit', function (e) { e.preventDefault(); if (!validate(cf)) return; cf.reset(); $('#c-okm').hidden = false; });

  // ---------- Carte schématique
  var X = function (c) { return 250 + c[1] * 18; }, Yc = function (c) { return 150 - c[2] * 14; };
  function drawMap(from, to, prog) {
    var m = $('#map'); if (!m) return;
    var h = '<rect width="480" height="280" fill="#FBF3DF"/><path d="M0 158C90 150 170 168 250 165S400 150 480 160L480 178C400 170 300 184 240 182S80 172 0 180Z" fill="#BFE0EE"/><text x="20" y="172" style="fill:#4A7E95">Lagune Ébrié</text>';
    h += '<g stroke="#E6D9B5" stroke-width="5" fill="none" stroke-linecap="round"><path d="M40 122L214 108L322 94L448 38"/><path d="M214 10L214 108L250 150L268 192L358 192L376 248"/><path d="M88 122L250 150"/></g>';
    D.communes.forEach(function (c) { var on = c[0] === from || c[0] === to; h += '<circle cx="' + X(c) + '" cy="' + Yc(c) + '" r="' + (on ? 6 : 4) + '" fill="' + (on ? '#111' : '#9A9587') + '"/><text x="' + (X(c) + 8) + '" y="' + (Yc(c) + 3) + '"' + (on ? ' style="fill:#111;font-weight:700"' : '') + '>' + c[0] + '</text>'; });
    if (from && to && from !== to) {
      var a = C[from], b = C[to], ax = X(a), ay = Yc(a), bx = X(b), by = Yc(b), mx = (ax + bx) / 2 + (by - ay) * 0.15, my = (ay + by) / 2 - (bx - ax) * 0.15;
      h += '<path d="M' + ax + ' ' + ay + 'Q' + mx + ' ' + my + ' ' + bx + ' ' + by + '" fill="none" stroke="#FFC21A" stroke-width="5" stroke-dasharray="9 7" stroke-linecap="round"/>';
      if (prog != null) { var t = Math.max(0, Math.min(1, prog)), px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * mx + t * t * bx, py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * my + t * t * by; h += '<circle cx="' + px + '" cy="' + py + '" r="10" fill="#FFC21A" stroke="#111" stroke-width="3"/><circle cx="' + px + '" cy="' + py + '" r="3.500" fill="#111"/>'; }
    }
    m.innerHTML = h;
  }

  // ---------- Accueil : onglets
  var tp = $('#t-prix'), ts = $('#t-suivi');
  if (tp && ts) {
    var sw = function (a) { var p = a === 'prix'; tp.setAttribute('aria-selected', p); ts.setAttribute('aria-selected', !p); $('#p-prix').hidden = !p; $('#p-suivi').hidden = p; };
    tp.addEventListener('click', function () { sw('prix'); }); ts.addEventListener('click', function () { sw('suivi'); });
  }

  // ---------- Livraison : calculateur
  var cd = $('#c-d');
  if (cd) {
    var ca = $('#c-a'), cp = $('#c-p'), qs = new URLSearchParams(location.search);
    if (qs.get('d') && C[qs.get('d')]) cd.value = qs.get('d'); if (qs.get('a') && C[qs.get('a')]) ca.value = qs.get('a'); if (qs.get('p') && pkgOf(qs.get('p'))) cp.value = qs.get('p');
    var calc = function () {
      var type = $('input[name=dt]:checked').value, q = quote(cd.value, ca.value, cp.value, type), go = $('#r-go');
      drawMap(cd.value, ca.value);
      if (!q) { $('#r-price').textContent = 'Sur devis'; $('#r-veh').textContent = 'Camionnette ou plus'; $('#r-km').textContent = '—'; $('#r-delay').textContent = '—'; go.href = 'contact.html#entreprise'; return; }
      $('#r-price').textContent = 'dès ' + fmt(q.price) + ' FCFA'; $('#r-veh').textContent = q.veh; $('#r-km').textContent = '≈ ' + q.km.toFixed(1).replace('.', ',') + ' km'; $('#r-delay').textContent = delayTxt(q, type);
      go.href = 'commander.html?d=' + encodeURIComponent(cd.value) + '&a=' + encodeURIComponent(ca.value) + '&p=' + cp.value + '&t=' + type;
    };
    $$('#calculateur select, #calculateur input').forEach(function (x) { x.addEventListener('change', calc); }); calc();
  }

  // ---------- Commander
  var ord = $('#order');
  if (ord) {
    var steps = $$('.step', ord), dots = $$('.progress li', ord), at = 0, od = $('#o-d'), oa = $('#o-a'), op = $('#o-p'), qs2 = new URLSearchParams(location.search);
    if (qs2.get('d') && C[qs2.get('d')]) od.value = qs2.get('d'); if (qs2.get('a') && C[qs2.get('a')]) oa.value = qs2.get('a'); if (qs2.get('p') && pkgOf(qs2.get('p'))) op.value = qs2.get('p');
    var typesBox = $('#o-types'), selType = D.dtypes[qs2.get('t')] ? qs2.get('t') : 'standard';
    var renderTypes = function () {
      typesBox.innerHTML = Object.keys(D.dtypes).map(function (k) {
        var q = quote(od.value, oa.value, op.value, k), dt = D.dtypes[k];
        return '<label class="opt"><input type="radio" name="ot" value="' + k + '"' + (k === selType ? ' checked' : '') + '><span><b>' + dt.label + '</b><small>' + dt.desc + (q ? ' · ' + delayTxt(q, k) : '') + '</small></span><span class="pp">' + (q ? 'dès ' + fmt(q.price) + ' FCFA' : 'sur devis') + '</span></label>';
      }).join('');
      $$('input[name=ot]', typesBox).forEach(function (r) { r.addEventListener('change', function () { selType = r.value; summary(); }); });
    };
    var summary = function () {
      var q = quote(od.value, oa.value, op.value, selType);
      drawMap && 0;
      $('#o-sum').innerHTML = '<div class="ln" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line)"><span>Colis</span><span>' + esc(pkgOf(op.value).label.split(' (')[0]) + '</span></div><div class="ln" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line)"><span>Trajet</span><span>' + esc(od.value) + ' → ' + esc(oa.value) + '</span></div><div class="ln" style="display:flex;justify-content:space-between;padding:6px 0"><span>Livraison</span><span>' + esc(D.dtypes[selType].label) + '</span></div>';
      $('#o-price').textContent = q ? 'dès ' + fmt(q.price) + ' FCFA' : 'Sur devis'; $('#o-delay').textContent = q ? delayTxt(q, selType) : '—';
    };
    [od, oa, op].forEach(function (x) { x.addEventListener('change', function () { renderTypes(); summary(); }); });
    renderTypes(); summary();
    var go = function (n) { at = n; steps.forEach(function (s, i) { s.classList.toggle('on', i === n); }); dots.forEach(function (d, i) { d.classList.toggle('on', i === n); d.classList.toggle('done', i < n); }); var h = $('h2', steps[n]); if (h) h.focus(); };
    $$('[data-next]', ord).forEach(function (b) {
      b.addEventListener('click', function () {
        if (at === 0) { var heavy = !pkgOf(op.value).v; $('#o-lourd').classList.toggle('show', heavy); if (heavy) return; }
        if (at === 1 && !validate(steps[1])) return;
        go(at + 1);
      });
    });
    $$('[data-prev]', ord).forEach(function (b) { b.addEventListener('click', function () { go(at - 1); }); });
    ord.addEventListener('submit', function (e) {
      e.preventDefault(); if (!validate(steps[2])) return;
      var orders = store.get('rx_orders', []), no;
      do { no = 'RX-2026-' + (1000 + Math.floor(Math.random() * 9000)); } while (orders.some(function (o) { return o.no === no; }));
      orders.push({ no: no, ts: Date.now(), from: od.value, to: oa.value, type: selType, pkg: op.value }); store.set('rx_orders', orders);
      steps.forEach(function (s) { s.classList.remove('on'); }); $('.progress', ord).style.display = 'none';
      $('#o-ref').textContent = no; $('.btn', $('#o-done')).href = 'suivi.html?n=' + no;
      var d = $('#o-done'); d.classList.add('show'); d.setAttribute('tabindex', '-1'); d.focus();
    });
  }

  // ---------- Suivi
  var tk = $('#track');
  if (tk) {
    var NAMES = [['Enregistré', 'Votre demande est enregistrée'], ['Collecté', 'Le livreur a récupéré le colis'], ['En route', 'Le colis est en chemin'], ['Livré', 'Remis au destinataire']];
    var now = Date.now();
    var tests = { 'RX-240001': { from: 'Cocody', to: 'Marcory', start: now - 35 * 60000, step: 2, type: 'standard' }, 'RX-240002': { from: 'Plateau', to: 'Yopougon', start: now - 185 * 60000, step: 3, type: 'express' } };
    var timer;
    var hhmm = function (t) { return new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); };
    var show = function (no, o) {
      $('#found').hidden = false; $('#t-err').classList.remove('show');
      var q = quote(o.from, o.to, 'petit', o.type || 'standard'), total = q && q.t ? q.t : 40;
      var draw = function () {
        var step, frac;
        if (o.step != null) { step = o.step; frac = step === 2 ? 0.55 : step === 3 ? 1 : 0; }
        else { var el = (Date.now() - o.ts) / 20000; step = Math.min(3, Math.floor(el)); frac = step === 2 ? Math.min(1, (el - 2)) : step === 3 ? 1 : 0; }
        var pct = [10, 35, 35 + 65 * Math.max(0.15, frac), 100][step];
        $('#s-fill').style.width = pct + '%'; $('#s-bar').setAttribute('aria-valuenow', Math.round(pct));
        $('#s-status').textContent = NAMES[step][0]; $('#s-status').className = 'status' + (step === 3 ? ' ok2' : '');
        $('#s-title').textContent = step === 3 ? 'Colis livré' : step === 2 ? 'Votre colis est en route' : step === 1 ? 'Votre colis a été collecté' : 'Commande enregistrée';
        $('#s-sub').textContent = o.from + ' → ' + o.to;
        var t0 = o.start || o.ts;
        $('#s-steps').innerHTML = NAMES.map(function (n, i) { return '<li class="' + (i < step ? 'done' : i === step ? (step === 3 ? 'done' : 'now') : '') + '"' + (i === step ? ' aria-current="step"' : '') + '><span><b>' + n[0] + '</b><small>' + (i <= step ? n[1] + ' · ' + hhmm(t0 + i * total * 0.3 * 60000) : 'À venir') + '</small></span></li>'; }).join('');
        $('#s-eta').textContent = step === 3 ? 'Livré à ' + hhmm(t0 + total * 60000) : 'vers ' + hhmm(t0 + total * 1.1 * 60000);
        drawMap(o.from, o.to, step === 3 ? 1 : step === 2 ? 0.25 + 0.6 * frac : step === 1 ? 0.05 : 0);
        if (step === 3 && timer) clearInterval(timer);
      };
      $('#s-no').textContent = no; $('#s-route').textContent = o.from + ' → ' + o.to;
      draw(); clearInterval(timer); if (o.step == null) timer = setInterval(draw, 2000);
    };
    var find = function (no) { no = no.trim().toUpperCase(); if (tests[no]) return tests[no]; var f = store.get('rx_orders', []).filter(function (o) { return o.no === no; })[0]; return f || null; };
    var lookup = function (no) { var o = find(no); if (!o) { $('#found').hidden = true; $('#t-err').classList.add('show'); return; } show(no.trim().toUpperCase(), o); };
    tk.addEventListener('submit', function (e) { e.preventDefault(); var v = $('#t-n').value; if (!v.trim()) { $('#t-err').classList.add('show'); return; } lookup(v); });
    var n0 = new URLSearchParams(location.search).get('n'); if (n0) { $('#t-n').value = n0; lookup(n0); }
  }

  // ---------- Location
  var cars = $('#cars');
  if (cars) {
    var cards = $$('.car', cars), type = 'all', d1 = $('#f-d1'), d2 = $('#f-d2'), tt = new Date();
    var iso = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    var t1 = new Date(tt.getFullYear(), tt.getMonth(), tt.getDate() + 1), t2 = new Date(tt.getFullYear(), tt.getMonth(), tt.getDate() + 3);
    d1.min = iso(t1); d2.min = iso(t1); d1.value = iso(t1); d2.value = iso(t2);
    var days = function () { var a = new Date(d1.value), b = new Date(d2.value); if (isNaN(a) || isNaN(b) || b < a) return 0; return Math.round((b - a) / 86400000) + 1; };
    var apply = function () {
      var pl = +$('#f-pl').value, ch = $('#f-ch').value, n = 0, dn = days();
      cards.forEach(function (c) {
        var cc = c.getAttribute('data-ch'), ok = (type === 'all' || c.getAttribute('data-type') === type) && +c.getAttribute('data-places') >= pl && (ch === 'all' || (ch === 'avec' && cc !== 'sans') || (ch === 'sans' && cc !== 'avec'));
        c.hidden = !ok; if (ok) n++;
        var tot = $('[data-tot]', c);
        if (dn) { var fee = (ch === 'avec' || cc === 'avec') ? +c.getAttribute('data-fee') : 0; tot.textContent = 'Total ' + dn + ' jour' + (dn > 1 ? 's' : '') + (fee || cc === 'avec' ? ' avec chauffeur' : '') + ' : ' + fmt(dn * (+c.getAttribute('data-price') + fee)) + ' FCFA'; } else tot.textContent = 'Dates invalides';
      });
      $('#c-count').textContent = n + (n > 1 ? ' véhicules' : ' véhicule'); $('#c-empty').style.display = n ? 'none' : 'block';
    };
    $$('.chips button').forEach(function (b) { b.addEventListener('click', function () { type = b.getAttribute('data-type'); $$('.chips button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); apply(); }); });
    [$('#f-pl'), $('#f-ch'), d1, d2].forEach(function (x) { x.addEventListener('change', function () { if (x === d1 && d2.value < d1.value) d2.value = d1.value; apply(); }); });
    apply();
    var sec = $('#reserver'), rf = $('#rform'), chosen = null;
    $$('[data-book]', cars).forEach(function (b) {
      b.addEventListener('click', function () {
        chosen = b.closest('.car'); sec.style.display = 'block'; $('#r-done').classList.remove('show');
        var dn = days(), fee = ($('#f-ch').value === 'avec' || chosen.getAttribute('data-ch') === 'avec') ? +chosen.getAttribute('data-fee') : 0;
        $('#r-sum').innerHTML = '<strong>' + esc($('h3', chosen).textContent) + '</strong><br>Du ' + esc(d1.value.split('-').reverse().join('/')) + ' au ' + esc(d2.value.split('-').reverse().join('/')) + ' (' + dn + ' jour' + (dn > 1 ? 's' : '') + ')' + (fee || chosen.getAttribute('data-ch') === 'avec' ? ' · avec chauffeur' : ' · sans chauffeur') + '<br>Total : <strong>' + fmt(dn * (+chosen.getAttribute('data-price') + fee)) + ' FCFA</strong>';
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    rf.addEventListener('submit', function (e) { e.preventDefault(); if (!validate(rf)) return; $('#r-ref').textContent = 'LC-2026-' + (1000 + Math.floor(Math.random() * 9000)); $('#r-name').textContent = $('#r-nom').value.trim(); var d = $('#r-done'); d.classList.add('show'); d.setAttribute('tabindex', '-1'); d.focus(); });
  }
})();
