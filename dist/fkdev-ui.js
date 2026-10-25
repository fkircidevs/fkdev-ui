/*! fkdev UI v2.4.1 · https://ui.fkdev.sbs · MIT · Furkan Kırcı */
(function (w, d) {
  'use strict';
  var VERSION = '2.4.1';
  var root = d.documentElement;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  root.classList.add('js');

  var ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 10"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/></svg>',
    danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
  };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  function each(scope, sel, fn, key) {
    key = key || '_fk';
    Array.prototype.forEach.call(scope.querySelectorAll(sel), function (el) {
      if (el[key]) return;
      el[key] = 1;
      fn(el);
    });
  }
  function emit(el, name, detail) {
    var ev;
    try { ev = new CustomEvent('fk:' + name, { bubbles: true, detail: detail }); } catch (e) { ev = d.createEvent('CustomEvent'); ev.initCustomEvent('fk:' + name, true, false, detail); }
    el.dispatchEvent(ev);
  }

  function toast(message, type, ms) {
    type = ICONS[type] ? type : 'info';
    ms = ms || 4500;
    var box = d.querySelector('.fk-toasts');
    if (!box) { box = d.createElement('div'); box.className = 'fk-toasts'; box.setAttribute('aria-live', 'polite'); box.setAttribute('aria-relevant', 'additions'); d.body.appendChild(box); }
    var el = d.createElement('div');
    el.className = 'fk-toast fk-toast-' + type;
    if (type === 'danger') el.setAttribute('role', 'alert');
    el.style.setProperty('--fk-toast-dur', ms + 'ms');
    el.innerHTML = ICONS[type] + '<div class="fk-toast-msg"></div><button type="button" class="fk-toast-x" aria-label="Bildirimi kapat">&times;</button><i class="fk-toast-bar" aria-hidden="true"></i>';
    el.querySelector('.fk-toast-msg').textContent = message;
    box.appendChild(el);
    var gone = false, timer;
    function close() { if (gone) return; gone = true; clearTimeout(timer); el.classList.add('is-out'); setTimeout(function () { el.remove(); }, 400); }
    el.querySelector('.fk-toast-x').addEventListener('click', close);
    timer = setTimeout(close, ms);
    return close;
  }

  function currentTheme() {
    return root.getAttribute('data-theme') || (w.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function syncToggles(t) {
    Array.prototype.forEach.call(d.querySelectorAll('[data-fk-theme-toggle]'), function (b) {
      b.setAttribute('aria-pressed', String(t === 'dark'));
      b.setAttribute('aria-label', t === 'dark' ? 'Aydınlık temaya geç' : 'Karanlık temaya geç');
    });
  }
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    store.set('fk-theme', t);
    syncToggles(t);
    emit(root, 'theme', { theme: t });
  }

  function copy(text) {
    if (navigator.clipboard && w.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res) {
      var ta = d.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      d.body.appendChild(ta); ta.select();
      try { d.execCommand('copy'); } catch (e) {}
      d.body.removeChild(ta); res();
    });
  }

  function splitWords(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = d.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(' ')); return; }
            var o = d.createElement('span'); o.className = 'w';
            var n = d.createElement('span'); n.className = 'wi'; n.style.setProperty('--i', i++); n.textContent = part;
            o.appendChild(n); frag.appendChild(o);
          });
          ch.parentNode.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR') { walk(ch); }
      });
    })(el);
    el.classList.add('fk-split');
  }

  function validateField(field) {
    var input = field.querySelector('input, select, textarea');
    if (!input) return true;
    var ok = input.checkValidity();
    field.classList.toggle('is-invalid', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    var err = field.querySelector('.fk-error');
    if (err) {
      if (!err.id) err.id = 'fk-err-' + Math.random().toString(36).slice(2, 8);
      input.setAttribute('aria-describedby', err.id);
      err.textContent = ok ? '' : (input.getAttribute('data-fk-msg') || input.validationMessage);
    }
    return ok;
  }

  function moveIndicator(bar, el) {
    var ind = bar.querySelector('.fk-tabsbar-ind');
    if (!ind) return;
    Array.prototype.forEach.call(bar.querySelectorAll('a, button'), function (x) { x.classList.toggle('is-ind', x === el); });
    if (!el) { ind.style.opacity = '0'; return; }
    ind.style.opacity = '1';
    ind.style.width = el.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + el.offsetLeft + 'px)';
  }

  var tipEl = null, tipFor = null;
  function showTip(el) {
    var text = el.getAttribute('data-fk-tip');
    if (!text) return;
    if (!tipEl) { tipEl = d.createElement('div'); tipEl.className = 'fk-tip'; tipEl.setAttribute('role', 'tooltip'); tipEl.id = 'fk-tip'; d.body.appendChild(tipEl); }
    tipFor = el;
    tipEl.textContent = text;
    tipEl.classList.remove('is-on', 'is-below');
    var r = el.getBoundingClientRect(), t = tipEl.getBoundingClientRect();
    var left = Math.max(8, Math.min(w.innerWidth - t.width - 8, r.left + r.width / 2 - t.width / 2));
    var top = r.top - t.height - 10;
    if (top < 8) { top = r.bottom + 10; tipEl.classList.add('is-below'); }
    tipEl.style.left = left + 'px';
    tipEl.style.top = top + 'px';
    tipEl.style.setProperty('--ax', (r.left + r.width / 2 - left) + 'px');
    el.setAttribute('aria-describedby', 'fk-tip');
    requestAnimationFrame(function () { if (tipFor === el) tipEl.classList.add('is-on'); });
  }
  function hideTip(el) {
    if (tipFor !== el) return;
    tipFor = null;
    if (tipEl) tipEl.classList.remove('is-on');
    if (el && el.getAttribute('aria-describedby') === 'fk-tip') el.removeAttribute('aria-describedby');
  }

  function openDialog(sel) {
    var m = typeof sel === 'string' ? d.querySelector(sel) : sel;
    if (m && m.showModal && !m.open) { m.showModal(); emit(m, 'open'); }
    return m;
  }
  function closeDialog(sel) {
    var m = typeof sel === 'string' ? d.querySelector(sel) : sel;
    if (m && m.open) m.close();
    return m;
  }
  function wireDialog(m) {
    m.addEventListener('click', function (e) {
      if (e.target !== m) return;
      var r = m.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) m.close();
    });
    m.addEventListener('close', function () { emit(m, 'close', { value: m.returnValue }); });
    Array.prototype.forEach.call(m.querySelectorAll('[data-fk-close]'), function (c) {
      c.addEventListener('click', function () { m.close(c.getAttribute('data-fk-close') || ''); });
    });
  }

  function confirmDialog(opts) {
    opts = typeof opts === 'string' ? { title: opts } : (opts || {});
    return new Promise(function (resolve) {
      var m = d.createElement('dialog');
      m.className = 'fk-modal';
      m.setAttribute('aria-labelledby', 'fk-cf-t');
      m.innerHTML = '<div class="fk-modal-head"><h3 class="fk-h3" id="fk-cf-t"></h3></div><div class="fk-modal-body"><p></p></div><div class="fk-modal-foot"><button type="button" class="fk-btn fk-btn-ghost" data-fk-close="no"></button><button type="button" class="fk-btn" data-fk-close="yes"></button></div>';
      m.querySelector('h3').textContent = opts.title || 'Emin misin?';
      m.querySelector('p').textContent = opts.text || '';
      if (!opts.text) m.querySelector('.fk-modal-body').remove();
      var no = m.querySelector('[data-fk-close="no"]'), yes = m.querySelector('[data-fk-close="yes"]');
      no.textContent = opts.cancel || 'Vazgeç';
      yes.textContent = opts.ok || 'Onayla';
      yes.classList.add(opts.danger ? 'fk-btn-danger' : 'fk-btn-primary');
      d.body.appendChild(m);
      wireDialog(m);
      m.addEventListener('close', function () { resolve(m.returnValue === 'yes'); setTimeout(function () { m.remove(); }, 50); });
      m.showModal();
      yes.focus();
    });
  }

  function sortTable(table, th) {
    var heads = Array.prototype.slice.call(table.querySelectorAll('thead th'));
    var col = heads.indexOf(th);
    var dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
    heads.forEach(function (h) { if (h.hasAttribute('aria-sort')) h.setAttribute('aria-sort', 'none'); });
    th.setAttribute('aria-sort', dir);
    var body = table.tBodies[0];
    var rows = Array.prototype.slice.call(body.rows);
    var type = th.getAttribute('data-fk-type') || 'text';
    function val(r) {
      var c = r.cells[col];
      var raw = c ? c.getAttribute('data-value') : null;
      var v = raw !== null ? raw : (c ? c.textContent.trim() : '');
      if (type === 'number') return raw !== null ? (parseFloat(raw) || 0) : (parseFloat(v.replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0);
      if (type === 'date') return Date.parse(v) || 0;
      return v.toLocaleLowerCase('tr');
    }
    rows.sort(function (a, b) {
      var x = val(a), y = val(b);
      var r = typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'tr');
      return dir === 'ascending' ? r : -r;
    });
    rows.forEach(function (r) { body.appendChild(r); });
    emit(table, 'sort', { column: col, direction: dir });
  }

  function init(scope) {
    scope = scope || d;

    each(scope, '[data-fk-theme-toggle]', function (b) {
      b.addEventListener('click', function () { setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); });
    });

    each(scope, '[data-fk-copy]', function (b) {
      b.addEventListener('click', function () {
        var src = b.getAttribute('data-fk-copy');
        var target = src && src.charAt(0) === '#' ? d.querySelector(src) : null;
        var text = target ? (target.matches('input, textarea, select') ? target.value : target.textContent) : src;
        copy(text).then(function () { toast(b.getAttribute('data-fk-msg') || 'Kopyalandı', 'success', 2600); });
      });
    });

    each(scope, '[data-fk-menu]', function (btn) {
      var menu = d.querySelector(btn.getAttribute('data-fk-menu'));
      if (!menu) return;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', menu.id);
      function place() {
        var r = btn.getBoundingClientRect();
        menu.style.setProperty('--fk-mx', Math.round(r.left + r.width / 2) + 'px');
        menu.style.setProperty('--fk-my', Math.round(r.top + r.height / 2) + 'px');
      }
      function set(open) {
        if (open) place();
        root.classList.toggle('fk-menu-open', open);
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
        if (open) {
          menu.scrollTop = 0;
          var nav = d.querySelector('.fk-navbar');
          if (nav) nav.classList.remove('is-hidden');
          var cur = menu.querySelector('[aria-current="page"]') || menu.querySelector('a');
          if (cur) setTimeout(function () { cur.focus({ preventScroll: true }); }, 450);
        }
        emit(menu, open ? 'open' : 'close');
      }
      btn.addEventListener('click', function () { set(!root.classList.contains('fk-menu-open')); });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && root.classList.contains('fk-menu-open')) { set(false); btn.focus(); }
        if (e.key === 'Tab' && root.classList.contains('fk-menu-open')) {
          var f = Array.prototype.slice.call(menu.querySelectorAll('a, button')).concat([btn]);
          var i = f.indexOf(d.activeElement);
          if (i === -1) { e.preventDefault(); f[0].focus(); }
          else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
          else if (e.shiftKey && i === 0) { e.preventDefault(); f[f.length - 1].focus(); }
        }
      });
      Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
        a.addEventListener('click', function () {
          var h = a.getAttribute('href') || '';
          if (a.getAttribute('aria-current') === 'page' || h.charAt(0) === '#') set(false);
        });
      });
      w.addEventListener('resize', function () { if (root.classList.contains('fk-menu-open')) place(); });
    });

    each(scope, '.fk-navbar[data-fk-autohide]', function (nav) {
      var lastY = w.scrollY, ticking = false;
      w.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          var y = w.scrollY;
          if (!root.classList.contains('fk-menu-open') && !nav.contains(d.activeElement)) {
            if (y > 320 && y > lastY + 4) nav.classList.add('is-hidden');
            else if (y < lastY - 4 || y < 320) nav.classList.remove('is-hidden');
          }
          lastY = y;
        });
      }, { passive: true });
      nav.addEventListener('focusin', function () { nav.classList.remove('is-hidden'); });
    });

    each(scope, '[data-fk-top]', function (b) {
      b.addEventListener('click', function () { w.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    });

    each(scope, '[data-fk-toast]', function (b) {
      b.addEventListener('click', function () { toast(b.getAttribute('data-fk-toast'), b.getAttribute('data-fk-type') || 'info'); });
    });

    each(scope, '[data-fk-open]', function (b) {
      b.setAttribute('aria-haspopup', 'dialog');
      b.addEventListener('click', function () { openDialog(b.getAttribute('data-fk-open')); });
    });
    each(scope, 'dialog.fk-modal, dialog.fk-drawer', wireDialog);

    each(scope, '[data-fk-tabs]', function (wrap) {
      var tabs = Array.prototype.slice.call(wrap.querySelectorAll('[role="tab"]'));
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          var p = d.getElementById(t.getAttribute('aria-controls'));
          if (p) { p.classList.toggle('is-active', on); p.hidden = !on; }
        });
        var bar = tab.closest('.fk-tabsbar');
        if (bar) moveIndicator(bar, tab);
        if (focus) tab.focus();
        emit(wrap, 'tab', { tab: tab });
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t); });
        t.addEventListener('keydown', function (e) {
          var n = null;
          if (e.key === 'ArrowRight') n = i + 1;
          else if (e.key === 'ArrowLeft') n = i - 1;
          else if (e.key === 'Home') n = 0;
          else if (e.key === 'End') n = tabs.length - 1;
          if (n === null) return;
          e.preventDefault();
          select(tabs[(n + tabs.length) % tabs.length], true);
        });
      });
      var first = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      if (first) requestAnimationFrame(function () { select(first); });
      w.addEventListener('resize', function () { var cur = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0]; var bar = cur && cur.closest('.fk-tabsbar'); if (bar) moveIndicator(bar, cur); });
    });

    each(scope, '.fk-tabsbar:not([role="tablist"])', function (bar) {
      var cur = bar.querySelector('[aria-current="page"]');
      Array.prototype.forEach.call(bar.querySelectorAll('a, button'), function (a) {
        a.addEventListener('pointerenter', function () { moveIndicator(bar, a); });
        a.addEventListener('focus', function () { moveIndicator(bar, a); });
        a.addEventListener('blur', function () { moveIndicator(bar, cur); });
      });
      bar.addEventListener('pointerleave', function () { moveIndicator(bar, cur); });
      requestAnimationFrame(function () { moveIndicator(bar, cur); });
      if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { moveIndicator(bar, cur); });
      w.addEventListener('resize', function () { moveIndicator(bar, cur); });
    });

    each(scope, 'details.fk-dropdown', function (dd) {
      var sum = dd.querySelector('summary');
      if (sum) sum.setAttribute('aria-haspopup', 'menu');
      if (sum) sum.setAttribute('aria-expanded', 'false');
      dd.addEventListener('toggle', function () {
        if (sum) sum.setAttribute('aria-expanded', String(dd.open));
      });
      dd.addEventListener('keydown', function (e) {
        var items = Array.prototype.slice.call(dd.querySelectorAll('.fk-dropdown-menu a, .fk-dropdown-menu button'));
        if (e.key === 'Escape' && dd.open) { dd.open = false; if (sum) sum.focus(); return; }
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && items.length) {
          e.preventDefault();
          if (!dd.open) dd.open = true;
          var i = items.indexOf(d.activeElement);
          i = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
          items[i].focus();
        }
      });
      Array.prototype.forEach.call(dd.querySelectorAll('.fk-dropdown-menu a, .fk-dropdown-menu button'), function (it) {
        it.addEventListener('click', function () { dd.open = false; });
      });
    });

    each(scope, '[data-fk-tip]', function (el) {
      el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') showTip(el); });
      el.addEventListener('pointerleave', function () { hideTip(el); });
      el.addEventListener('focus', function () { if (el.matches(':focus-visible')) showTip(el); });
      el.addEventListener('blur', function () { hideTip(el); });
      el.addEventListener('click', function () { hideTip(el); });
    });

    each(scope, 'form[data-fk-validate]', function (form) {
      form.setAttribute('novalidate', '');
      Array.prototype.forEach.call(form.querySelectorAll('.fk-field'), function (f) {
        var input = f.querySelector('input, select, textarea');
        if (!input) return;
        input.addEventListener('blur', function () { validateField(f); });
        input.addEventListener('input', function () { if (f.classList.contains('is-invalid')) validateField(f); });
      });
      form.addEventListener('submit', function (e) {
        var ok = true;
        Array.prototype.forEach.call(form.querySelectorAll('.fk-field'), function (f) { if (!validateField(f)) ok = false; });
        Array.prototype.forEach.call(form.querySelectorAll('input[required]'), function (i) { if (!i.closest('.fk-field') && !i.checkValidity()) ok = false; });
        if (!ok) {
          e.preventDefault();
          var bad = form.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea, input:invalid');
          if (bad) bad.focus();
          toast(form.getAttribute('data-fk-error') || 'Lütfen işaretli alanları kontrol edin.', 'danger');
          return;
        }
        if (form.hasAttribute('data-fk-demo')) {
          e.preventDefault();
          var btn = form.querySelector('[type="submit"]');
          if (btn) btn.classList.add('is-loading');
          setTimeout(function () {
            if (btn) btn.classList.remove('is-loading');
            form.reset();
            toast(form.getAttribute('data-fk-success') || 'Gönderildi. Teşekkürler!', 'success');
          }, 1200);
        }
      });
    });

    each(scope, '.fk-drop', function (drop) {
      var input = drop.querySelector('input[type="file"]');
      var out = drop.querySelector('.fk-drop-file');
      if (!input) return;
      ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.add('is-over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.remove('is-over'); }); });
      input.addEventListener('change', function () {
        if (!out) return;
        var files = Array.prototype.slice.call(input.files || []);
        out.textContent = files.map(function (f) { return f.name + ' · ' + (f.size / 1048576).toFixed(2) + ' MB'; }).join(', ');
      });
    });

    each(scope, '[data-fk-password]', function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var input = b.parentNode.querySelector('input');
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        b.setAttribute('aria-pressed', String(show));
        b.setAttribute('aria-label', show ? 'Şifreyi gizle' : 'Şifreyi göster');
      });
    });

    each(scope, '[data-fk-counter]', function (field) {
      var input = field.querySelector('input, textarea');
      var out = field.querySelector('.fk-counter');
      if (!input) return;
      var max = parseInt(input.getAttribute('maxlength') || field.getAttribute('data-fk-counter'), 10) || 0;
      if (!out) { out = d.createElement('span'); out.className = 'fk-counter'; field.appendChild(out); }
      out.setAttribute('aria-live', 'polite');
      function upd() {
        var n = input.value.length;
        out.textContent = max ? n + ' / ' + max : String(n);
        out.classList.toggle('is-near', max && n >= max * 0.9 && n < max);
        out.classList.toggle('is-full', max && n >= max);
      }
      input.addEventListener('input', upd);
      upd();
    });

    each(scope, '.fk-otp', function (box) {
      var ins = Array.prototype.slice.call(box.querySelectorAll('input'));
      var hidden = box.querySelector('input[type="hidden"]');
      ins = ins.filter(function (i) { return i.type !== 'hidden'; });
      function sync() { var v = ins.map(function (i) { return i.value; }).join(''); if (hidden) hidden.value = v; if (v.length === ins.length) emit(box, 'complete', { value: v }); }
      ins.forEach(function (inp, i) {
        inp.setAttribute('inputmode', 'numeric');
        inp.setAttribute('maxlength', '1');
        inp.setAttribute('autocomplete', i === 0 ? 'one-time-code' : 'off');
        inp.addEventListener('input', function () {
          inp.value = inp.value.replace(/\D/g, '').slice(-1);
          if (inp.value && ins[i + 1]) ins[i + 1].focus();
          sync();
        });
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Backspace' && !inp.value && ins[i - 1]) { ins[i - 1].focus(); ins[i - 1].value = ''; sync(); e.preventDefault(); }
          if (e.key === 'ArrowLeft' && ins[i - 1]) ins[i - 1].focus();
          if (e.key === 'ArrowRight' && ins[i + 1]) ins[i + 1].focus();
        });
        inp.addEventListener('paste', function (e) {
          var t = ((e.clipboardData || w.clipboardData).getData('text') || '').replace(/\D/g, '');
          if (!t) return;
          e.preventDefault();
          ins.forEach(function (x, j) { x.value = t[j] || ''; });
          (ins[Math.min(t.length, ins.length) - 1] || inp).focus();
          sync();
        });
      });
    });

    each(scope, '.fk-stepper', function (st) {
      var input = st.querySelector('input');
      var btns = st.querySelectorAll('button');
      if (!input || btns.length < 2) return;
      function step(dir) {
        var v = parseFloat(input.value) || 0, s = parseFloat(input.step) || 1;
        var min = input.min !== '' ? parseFloat(input.min) : -Infinity, max = input.max !== '' ? parseFloat(input.max) : Infinity;
        input.value = Math.min(max, Math.max(min, v + dir * s));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      btns[0].addEventListener('click', function () { step(-1); });
      btns[btns.length - 1].addEventListener('click', function () { step(1); });
    });

    each(scope, '.fk-tags[data-fk-tags]', function (box) {
      var input = box.querySelector('input:not([type="hidden"])');
      var hidden = box.querySelector('input[type="hidden"]');
      if (!input) return;
      function values() { return Array.prototype.map.call(box.querySelectorAll('.fk-tag'), function (t) { return t.getAttribute('data-value'); }); }
      function sync() { if (hidden) hidden.value = values().join(','); emit(box, 'tags', { values: values() }); }
      function add(text) {
        text = text.trim();
        if (!text || values().indexOf(text) >= 0) return;
        var t = d.createElement('span');
        t.className = 'fk-tag';
        t.setAttribute('data-value', text);
        t.textContent = text;
        var x = d.createElement('button');
        x.type = 'button'; x.className = 'fk-tag-x'; x.setAttribute('aria-label', text + ' etiketini kaldır'); x.innerHTML = '&times;';
        t.appendChild(x);
        box.insertBefore(t, input);
        sync();
      }
      Array.prototype.forEach.call(box.querySelectorAll('.fk-tag'), function (t) { if (!t.getAttribute('data-value')) t.setAttribute('data-value', t.firstChild.textContent.trim()); });
      box.addEventListener('click', function (e) {
        var x = e.target.closest('.fk-tag-x');
        if (x) { x.parentNode.remove(); sync(); input.focus(); return; }
        if (e.target === box) input.focus();
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input.value); input.value = ''; }
        else if (e.key === 'Backspace' && !input.value) { var last = box.querySelectorAll('.fk-tag'); if (last.length) { last[last.length - 1].remove(); sync(); } }
      });
      input.addEventListener('blur', function () { if (input.value) { add(input.value); input.value = ''; } });
      sync();
    });

    each(scope, 'table[data-fk-sort]', function (table) {
      Array.prototype.forEach.call(table.querySelectorAll('thead th'), function (th) {
        if (th.hasAttribute('data-fk-nosort') || !th.textContent.trim()) return;
        var b = d.createElement('button');
        b.type = 'button';
        while (th.firstChild) b.appendChild(th.firstChild);
        th.appendChild(b);
        th.setAttribute('aria-sort', 'none');
        b.addEventListener('click', function () { sortTable(table, th); });
      });
    });

    each(scope, '[data-fk-dismiss]', function (el) {
      var key = 'fk-dismiss-' + el.getAttribute('data-fk-dismiss');
      if (store.get(key)) { el.remove(); return; }
      var x = el.querySelector('.fk-banner-x, [data-fk-dismiss-btn]');
      if (x) x.addEventListener('click', function () { store.set(key, '1'); el.remove(); });
    });

    each(scope, '.fk-readbar', function (bar) {
      var ticking = false;
      function upd() { ticking = false; var h = root.scrollHeight - w.innerHeight; bar.style.setProperty('--p', h > 0 ? Math.min(1, w.scrollY / h) : 0); }
      w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
      upd();
    });

    if (!reduce) each(scope, '[data-fk-split]', function (el) { if (!el.classList.contains('fk-split')) splitWords(el); }, '_fks');

    var watch = scope.querySelectorAll('.fk-reveal:not(.is-in), .fk-split:not(.is-in), [data-fk-count]:not(.is-in), .fk-ring[data-fk-value]:not(.is-in)');
    if ('IntersectionObserver' in w) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          el.classList.add('is-in');
          if (el.hasAttribute('data-fk-count') && !reduce) {
            var target = parseFloat(el.getAttribute('data-fk-count')), t0 = performance.now();
            var fmt = w.Intl ? new Intl.NumberFormat('tr-TR') : null;
            (function step(now) {
              var p = Math.min(1, (now - t0) / 1600);
              var v = Math.round(target * (1 - Math.pow(1 - p, 4)));
              el.textContent = fmt && target >= 10000 ? fmt.format(v) : v;
              if (p < 1) requestAnimationFrame(step);
            })(t0);
          }
          if (el.hasAttribute('data-fk-value')) {
            var to = parseFloat(el.getAttribute('data-fk-value')) || 0;
            if (reduce) el.style.setProperty('--v', to);
            else { var s0 = performance.now(); (function grow(now) { var q = Math.min(1, (now - s0) / 1400); el.style.setProperty('--v', (to * (1 - Math.pow(1 - q, 3))).toFixed(4)); if (q < 1) requestAnimationFrame(grow); })(s0); }
          }
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      Array.prototype.forEach.call(watch, function (el) { io.observe(el); });
    } else {
      Array.prototype.forEach.call(watch, function (el) { el.classList.add('is-in'); if (el.hasAttribute('data-fk-value')) el.style.setProperty('--v', el.getAttribute('data-fk-value')); });
    }

    each(scope, '.fk-card', function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    if (fine && !reduce) each(scope, '[data-fk-magnetic]', function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    }, '_fkm');
  }

  d.addEventListener('click', function (e) {
    Array.prototype.forEach.call(d.querySelectorAll('details.fk-dropdown[open]'), function (dd) { if (!dd.contains(e.target)) dd.open = false; });
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (tipFor) hideTip(tipFor);
      Array.prototype.forEach.call(d.querySelectorAll('details.fk-dropdown[open]'), function (dd) { dd.open = false; });
    }
  });
  w.addEventListener('scroll', function () { if (tipFor) hideTip(tipFor); }, { passive: true });
  if (w.matchMedia) {
    var mq = w.matchMedia('(prefers-color-scheme: dark)');
    var onScheme = function () { if (!root.getAttribute('data-theme')) syncToggles(currentTheme()); };
    if (mq.addEventListener) mq.addEventListener('change', onScheme); else if (mq.addListener) mq.addListener(onScheme);
  }

  var saved = store.get('fk-theme');
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  function boot() { init(); syncToggles(currentTheme()); emit(root, 'ready', { version: VERSION }); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();

  w.FK = {
    version: VERSION,
    init: init,
    toast: toast,
    confirm: confirmDialog,
    open: openDialog,
    close: closeDialog,
    setTheme: setTheme,
    theme: currentTheme,
    copy: copy,
    split: splitWords,
    sort: sortTable
  };
})(window, document);
