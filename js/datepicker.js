/* ─────────────────────────────────────────────────────────────────────────────
   datepicker.js — Wheel picker (estilo iPhone) para la fecha del sorteo.

   Integración externa (SIN CAMBIOS respecto a la versión anterior):
     #btn-date        → botón que abre el selector
     #btn-date-text   → texto del botón (muestra la fecha elegida)
     #f-date          → input hidden que guarda "YYYY-MM-DD" (lo lee nueva-rifa.js)
     #dp-modal        → contenedor del selector (clase .show para mostrar)
     #dp-confirm      → botón confirmar

   Reglas: solo desde MAÑANA en adelante. Años 2024–2028.
   ───────────────────────────────────────────────────────────────────────────── */
(function (global) {
  'use strict';

  var MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  /* El alto de fila lo manda el CSS (--dp-item-h). Aquí solo se lee. */
  var ITEM_H   = 36;
  var VISIBLE  = 5;
  var YEAR_MIN = 2024;
  var YEAR_MAX = 2028;

  function readItemH() {
    var el = document.getElementById('dp-modal');
    if (!el) return ITEM_H;
    var v = parseFloat(getComputedStyle(el).getPropertyValue('--dp-item-h'));
    return (v && v > 8) ? v : ITEM_H;
  }

  function byId(id) { return document.getElementById(id); }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

  /* Primera fecha permitida: mañana */
  function minAllowed() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  }

  function parseISO(v) {
    if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    var p = v.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setHours(0, 0, 0, 0);
    return isNaN(d) ? null : d;
  }

  /* ── una rueda ──────────────────────────────────────────────────────────── */
  function Wheel(col, onCommit) {
    col.innerHTML = '';
    var PAD = ((VISIBLE - 1) / 2) * ITEM_H;
    var scroll = document.createElement('div');
    scroll.className = 'dp-scroll';
    scroll.style.paddingTop = PAD + 'px';
    scroll.style.paddingBottom = PAD + 'px';
    col.appendChild(scroll);

    var els = [], data = [], idx = 0, last = null;
    var rafId = null, timer = null;
    var dragging = false, moved = false, pid = null, startY = 0, startTop = 0;

    function paint() {
      var c = scroll.scrollTop / ITEM_H;
      for (var i = 0; i < els.length; i++) {
        var d = i - c, ad = Math.abs(d), el = els[i];
        if (ad > 3.4) {
          if (el.style.opacity !== '0') { el.style.opacity = '0'; el.style.transform = 'none'; }
          continue;
        }
        var k = Math.min(ad, 3);
        el.style.opacity = '' + Math.max(0.12, 1 - k * 0.27);
        el.style.transform = 'rotateX(' + (-d * 18) + 'deg) scale(' + (1 - k * 0.05) + ')';
      }
    }

    function schedulePaint() {
      if (rafId == null) {
        rafId = requestAnimationFrame(function () { rafId = null; paint(); });
      }
    }

    function clamp(i) { return Math.max(0, Math.min(i, data.length - 1)); }

    /* índice habilitado más cercano (prioriza hacia adelante) */
    function nearestOn(i) {
      if (!data.length) return 0;
      i = clamp(i);
      if (!data[i].off) return i;
      for (var k = 1; k < data.length; k++) {
        if (data[i + k] && !data[i + k].off) return i + k;
        if (data[i - k] && !data[i - k].off) return i - k;
      }
      return i;
    }

    function indexOfValue(v) {
      for (var i = 0; i < data.length; i++) if (data[i].value === v) return i;
      return -1;
    }

    /* se llama solo cuando el scroll se detiene: nada de saltos a media inercia */
    function settle() {
      if (dragging) return;
      var t = nearestOn(Math.round(scroll.scrollTop / ITEM_H));
      idx = t;
      if (Math.abs(scroll.scrollTop - t * ITEM_H) > 0.5) {
        scroll.scrollTo({ top: t * ITEM_H, behavior: 'smooth' });
      }
      var v = data[t] ? data[t].value : null;
      if (v !== last) { last = v; onCommit(v); }
    }

    scroll.addEventListener('scroll', function () {
      schedulePaint();
      clearTimeout(timer);
      timer = setTimeout(settle, 90);
    }, { passive: true });

    /* arrastre con mouse/lápiz (en táctil manda el scroll nativo) */
    scroll.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      dragging = true; moved = false; pid = e.pointerId;
      startY = e.clientY; startTop = scroll.scrollTop;
      scroll.style.scrollSnapType = 'none';
      try { scroll.setPointerCapture(pid); } catch (_) {}
    });
    scroll.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      var dy = e.clientY - startY;
      if (Math.abs(dy) > 3) moved = true;
      scroll.scrollTop = startTop - dy;
      schedulePaint();
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      try { scroll.releasePointerCapture(pid); } catch (_) {}
      scroll.style.scrollSnapType = 'y mandatory';
      settle();
      setTimeout(function () { moved = false; }, 0);
    }
    scroll.addEventListener('pointerup', endDrag);
    scroll.addEventListener('pointercancel', endDrag);

    function setItems(items, value) {
      var sameLen = items.length === data.length;
      if (!sameLen) {
        scroll.innerHTML = '';
        els = [];
        for (var i = 0; i < items.length; i++) {
          var el = document.createElement('div');
          el.className = 'dp-item';
          el.textContent = items[i].label;
          el.addEventListener('click', (function (n) {
            return function () {
              if (moved || !data[n] || data[n].off) return;
              scroll.scrollTo({ top: n * ITEM_H, behavior: 'smooth' });
            };
          })(i));
          scroll.appendChild(el);
          els.push(el);
        }
      } else {
        for (var j = 0; j < items.length; j++) els[j].textContent = items[j].label;
      }
      data = items;
      for (var k = 0; k < data.length; k++) {
        els[k].classList.toggle('dp-item--off', !!data[k].off);
      }
      var ix = indexOfValue(value);
      if (ix < 0) ix = nearestOn(0);
      if (ix !== idx || !sameLen) {
        idx = ix;
        scroll.scrollTop = ix * ITEM_H;   /* posición exacta: sin snap peleando */
      }
      last = data[idx] ? data[idx].value : null;
      paint();
    }

    return { setItems: setItems, repaint: paint };
  }

  /* ── estado ─────────────────────────────────────────────────────────────── */
  var state = { y: 0, m: 0, d: 0 };
  var wheels = null, MIN = null, inited = false;

  function yearItems() {
    var out = [];
    for (var y = YEAR_MIN; y <= YEAR_MAX; y++) {
      out.push({ value: y, label: '' + y, off: y < MIN.getFullYear() });
    }
    return out;
  }
  function monthItems(y) {
    return MONTHS.map(function (name, i) {
      return {
        value: i,
        label: name,
        off: y < MIN.getFullYear() || (y === MIN.getFullYear() && i < MIN.getMonth())
      };
    });
  }
  function dayItems(y, m) {
    var total = daysInMonth(y, m), out = [];
    var sameMonth = (y === MIN.getFullYear() && m === MIN.getMonth());
    for (var d = 1; d <= total; d++) {
      out.push({ value: d, label: pad2(d), off: sameMonth && d < MIN.getDate() });
    }
    return out;
  }

  function readout() {
    var dt = new Date(state.y, state.m, state.d);
    var s = dt.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    byId('dp-readout').textContent = s.charAt(0).toUpperCase() + s.slice(1) + ' de ' + state.y;
  }

  /* re-sincroniza las tres ruedas; las que ya están en su sitio no se mueven */
  function sync() {
    wheels.year.setItems(yearItems(), state.y);

    var mi = monthItems(state.y);
    if (mi[state.m] && mi[state.m].off) {
      for (var i = 0; i < mi.length; i++) { if (!mi[i].off) { state.m = i; break; } }
    }
    wheels.month.setItems(mi, state.m);

    var di = dayItems(state.y, state.m);
    if (state.d > di.length) state.d = di.length;
    if (di[state.d - 1] && di[state.d - 1].off) {
      for (var k = 0; k < di.length; k++) { if (!di[k].off) { state.d = di[k].value; break; } }
    }
    wheels.day.setItems(di, state.d);

    readout();
  }

  function build() {
    ITEM_H = readItemH();
    wheels = {
      day: Wheel(byId('dp-col-day'), function (v) {
        if (v == null) return;
        state.d = v; sync();
      }),
      month: Wheel(byId('dp-col-month'), function (v) {
        if (v == null) return;
        state.m = v; sync();
      }),
      year: Wheel(byId('dp-col-year'), function (v) {
        if (v == null) return;
        state.y = v; sync();
      })
    };
  }

  function labelFor(dt) {
    return dt.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function open() {
    MIN = minAllowed();
    var cur = parseISO(byId('f-date').value);
    var base = (cur && cur >= MIN) ? cur : MIN;
    state.y = Math.min(Math.max(base.getFullYear(), YEAR_MIN), YEAR_MAX);
    state.m = base.getMonth();
    state.d = base.getDate();

    if (!wheels) build();
    byId('dp-modal').classList.add('show');
    sync();
    document.body.style.overflow = 'hidden';
  }

  function close() {
    byId('dp-modal').classList.remove('show');
    document.body.style.overflow = '';
  }

  function confirm() {
    var dt = new Date(state.y, state.m, state.d);
    byId('f-date').value = state.y + '-' + pad2(state.m + 1) + '-' + pad2(state.d);
    byId('btn-date-text').textContent = labelFor(dt);
    byId('btn-date').classList.add('has-date');
    close();
  }

  function init() {
    if (inited) return true;
    var modal = byId('dp-modal');
    if (!modal || !byId('btn-date') || !byId('f-date')) return false;
    inited = true;
    MIN = minAllowed();

    byId('btn-date').addEventListener('click', open);
    byId('dp-confirm').addEventListener('click', confirm);

    var cancel = byId('dp-cancel');
    if (cancel) cancel.addEventListener('click', close);

    modal.querySelectorAll('[data-dp-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) close();
    });

    /* si el formulario ya traía fecha, reflejarla en el botón */
    var cur = parseISO(byId('f-date').value);
    if (cur) byId('btn-date-text').textContent = labelFor(cur);

    return true;
  }

  global.RifaDatePicker = { init: init, open: open, close: close };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
