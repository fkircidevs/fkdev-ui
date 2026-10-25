(function () {
  var d = document, root = d.documentElement;

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var STR = '"(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\'';
  var RULES = {
    html: [['c', '<!--[\\s\\S]*?-->'], ['t', '</?[a-zA-Z][\\w-]*|/?>'], ['s', '"[^"]*"|\'[^\']*\''], ['a', '[a-zA-Z_:@][\\w:.-]*(?==)']],
    css: [['c', '/\\*[\\s\\S]*?\\*/'], ['s', STR], ['v', '--[\\w-]+'], ['a', '(?<=[{;\\s])[a-z-]+(?=\\s*:)'], ['t', '[.#][a-zA-Z][\\w-]*(?=[^;{}]*\\{)|@[a-z-]+'], ['n', '#[0-9a-fA-F]{3,8}\\b|\\b\\d+(?:\\.\\d+)?(?:px|rem|em|%|ms|s|vh|vw|vmax|deg|fr)?\\b']],
    js: [['c', '//[^\\n]*|/\\*[\\s\\S]*?\\*/'], ['s', '`[^`]*`|' + STR], ['k', '\\b(?:const|let|var|function|return|if|else|for|while|await|async|import|from|export|default|new|try|catch|throw|class|extends|of|in|true|false|null|undefined|this|typeof)\\b'], ['n', '\\b\\d+(?:\\.\\d+)?\\b']],
    php: [['c', '//[^\\n]*|/\\*[\\s\\S]*?\\*/|(?<![\\w\'"])#[^\\n]*'], ['s', STR], ['t', '<\\?php|\\?>'], ['v', '\\$[a-zA-Z_]\\w*'], ['k', '\\b(?:function|return|if|else|elseif|foreach|as|echo|new|use|require|require_once|include|try|catch|throw|class|public|private|static|fn|match|null|true|false|exit|isset|empty|declare|namespace)\\b'], ['n', '\\b\\d+\\b']],
    sql: [['c', '--[^\\n]*'], ['s', '\'(?:[^\'\\\\]|\\\\.)*\''], ['k', '\\b(?:CREATE|TABLE|IF|NOT|EXISTS|PRIMARY|KEY|FOREIGN|REFERENCES|ON|DELETE|UPDATE|CASCADE|SET|NULL|DEFAULT|UNIQUE|INDEX|INSERT|INTO|VALUES|SELECT|FROM|WHERE|AND|OR|ORDER|BY|LIMIT|JOIN|LEFT|INNER|GROUP|AS|DESC|ASC|ENGINE|CHARSET|COLLATE|AUTO_INCREMENT|UNSIGNED|ENUM|CURRENT_TIMESTAMP|COUNT|BIGINT|INT|TINYINT|SMALLINT|VARCHAR|TEXT|MEDIUMTEXT|LONGTEXT|JSON|TIMESTAMP|DATETIME|BOOLEAN|DECIMAL|CHAR|CONSTRAINT|ALTER|ADD|COMMENT|RESTRICT|NOW|INTERVAL|DAY)\\b'], ['n', '\\b\\d+\\b']],
    bash: [['c', '(?<![\\w$])#[^\\n]*'], ['s', '"[^"]*"|\'[^\']*\''], ['k', '\\b(?:npm|npx|node|composer|php|curl|git|vercel|cd|mkdir|export)\\b'], ['v', '\\$[A-Z_]+']],
    apache: [['c', '^\\s*#[^\\n]*'], ['s', '"[^"]*"'], ['k', '^\\s*</?[A-Za-z]+|^\\s*[A-Z][A-Za-z]+']],
    json: [['a', '"(?:[^"\\\\]|\\\\.)*"(?=\\s*:)'], ['s', '"(?:[^"\\\\]|\\\\.)*"'], ['k', '\\b(?:true|false|null)\\b'], ['n', '-?\\b\\d+(?:\\.\\d+)?\\b']]
  };
  RULES.ts = RULES.js;
  var COMPILED = {};
  function highlight(code) {
    var lang = (code.className.match(/lang-(\w+)/) || [])[1];
    var rules = RULES[lang];
    var src = code.textContent;
    if (!rules) { code.innerHTML = esc(src); return; }
    var re = COMPILED[lang] || (COMPILED[lang] = new RegExp(rules.map(function (r) { return '(' + r[1] + ')'; }).join('|'), 'gm'));
    re.lastIndex = 0;
    var out = '', last = 0, m;
    while ((m = re.exec(src))) {
      if (!m[0].length) { re.lastIndex++; continue; }
      var gi = 1;
      while (gi < m.length && m[gi] === undefined) gi++;
      out += esc(src.slice(last, m.index)) + '<span class="tok-' + rules[gi - 1][0] + '">' + esc(m[0]) + '</span>';
      last = m.index + m[0].length;
    }
    code.innerHTML = out + esc(src.slice(last));
  }
  d.querySelectorAll('pre code').forEach(highlight);

  d.querySelectorAll('.copy-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var code = b.closest('.ex-code, .codeblock').querySelector('pre code');
      FK.copy(code.textContent).then(function () {
        var old = b.innerHTML;
        b.classList.add('is-done');
        b.textContent = 'Kopyalandı';
        setTimeout(function () { b.classList.remove('is-done'); b.innerHTML = old; }, 1600);
      });
    });
  });

  d.querySelectorAll('[data-copy-icon]').forEach(function (b) {
    b.addEventListener('click', function () {
      FK.copy(b.querySelector('svg').outerHTML).then(function () { FK.toast('“' + b.getAttribute('data-copy-icon') + '” ikonu SVG olarak kopyalandı', 'success', 2400); });
    });
  });

  if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) d.querySelectorAll('.docs-search-btn .fk-kbd').forEach(function (k) { k.textContent = '⌘ K'; });
  var tocLinks = Array.prototype.slice.call(d.querySelectorAll('.docs-toc a'));
  var heads = Array.prototype.slice.call(d.querySelectorAll('.doc section[id]'));
  if ('IntersectionObserver' in window && heads.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        tocLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    heads.forEach(function (h) { spy.observe(h); });
  }

  var dlg = d.getElementById('search');
  var input = dlg && dlg.querySelector('input');
  var list = dlg && dlg.querySelector('.search-res');
  var index = null, sel = 0, results = [];
  function norm(s) { return s.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i'); }
  function render() {
    var q = norm(input.value.trim());
    if (!index) { list.innerHTML = '<li class="empty">Yükleniyor…</li>'; return; }
    results = q ? index.filter(function (e) { return e.k.indexOf(q) >= 0; }).slice(0, 40) : index.filter(function (e) { return e.top; }).slice(0, 14);
    sel = 0;
    if (!results.length) { list.innerHTML = '<li class="empty">“' + esc(input.value) + '” için sonuç yok.</li>'; return; }
    list.innerHTML = results.map(function (e, i) { return '<li><a href="' + e.u + '"' + (i === 0 ? ' class="is-sel"' : '') + '><b>' + esc(e.t) + '</b><span>' + esc(e.p) + '</span></a></li>'; }).join('');
  }
  function openSearch() {
    if (!dlg) return;
    if (!dlg.open) dlg.showModal();
    input.value = '';
    render();
    input.focus();
    if (!index) fetch('/assets/search.json').then(function (r) { return r.json(); }).then(function (j) {
      index = j.map(function (e) { e.k = norm(e.t + ' ' + e.p + ' ' + (e.x || '')); return e; });
      render();
    }).catch(function () { list.innerHTML = '<li class="empty">Arama dizini yüklenemedi.</li>'; });
  }
  d.querySelectorAll('[data-search]').forEach(function (b) { b.addEventListener('click', openSearch); });
  d.addEventListener('keydown', function (e) {
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openSearch(); }
    else if (e.key === '/' && !/input|textarea|select/i.test(d.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });
  if (dlg) {
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      var links = list.querySelectorAll('a');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!links.length) return;
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links.forEach(function (a, i) { a.classList.toggle('is-sel', i === sel); });
        links[sel].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && links[sel]) { e.preventDefault(); location.href = links[sel].href; dlg.close(); }
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    list.addEventListener('click', function () { dlg.close(); });
  }

  d.querySelectorAll('[data-chat-demo]').forEach(function (chat) {
    var form = chat.querySelector('form');
    var log = chat.querySelector('.fk-chat');
    var answers = [
      'Merhaba! Bu demo gerçek API çağırmaz; gerçek entegrasyon için aşağıdaki Node.js ve PHP örneklerine bak.',
      'fkdev UI ile bir form kurmak için .fk-form, .fk-field ve .fk-input sınıflarını kullanabilirsin.',
      'API anahtarını asla tarayıcıya koyma; isteği her zaman kendi sunucundan at.'
    ];
    var n = 0;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = form.querySelector('input');
      var q = inp.value.trim();
      if (!q) return;
      var u = d.createElement('div'); u.className = 'fk-msg fk-msg-user'; u.textContent = q; log.appendChild(u);
      inp.value = '';
      var a = d.createElement('div'); a.className = 'fk-msg fk-msg-ai'; a.innerHTML = '<span class="fk-typing"><i></i><i></i><i></i></span>'; log.appendChild(a);
      var text = answers[n++ % answers.length], i = 0;
      setTimeout(function () {
        a.textContent = '';
        (function type() { a.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(type, 14); })();
      }, 700);
    });
  });

  var cf = d.getElementById('demo-confirm');
  if (cf) cf.addEventListener('click', function () {
    FK.confirm({ title: 'Dosya silinsin mi?', text: 'proje.zip kalıcı olarak silinecek. Bu işlem geri alınamaz.', ok: 'Evet, sil', cancel: 'Vazgeç', danger: true })
      .then(function (ok) { FK.toast(ok ? 'Dosya silindi (demo)' : 'İşlem iptal edildi', ok ? 'success' : 'info'); });
  });

  var lat = d.querySelector('[data-latency]');
  if (lat) {
    var num = lat.querySelector('.latency-num b');
    var meta = lat.querySelector('[data-latency-meta]');
    var bars = lat.querySelector('.latency-bars');
    var target = lat.getAttribute('data-latency');
    var entry = (performance.getEntriesByType ? performance.getEntriesByType('resource') : []).filter(function (e) { return e.name.indexOf(target) >= 0; })[0];
    if (entry && entry.responseStart > 0) {
      num.textContent = Math.max(1, Math.round(entry.responseStart - entry.requestStart || entry.duration));
      meta.textContent = 'Sayfa açılırken ' + target.split('/').pop() + ' dosyasının ilk bayt süresi (TTFB). Tarayıcı önbelleğinden geldiyse 0’a yakın görünür.';
    }
    var runBtn = lat.querySelector('[data-latency-run]');
    if (runBtn) runBtn.addEventListener('click', function () {
      runBtn.classList.add('is-loading');
      var out = [], n = 0;
      (function next() {
        var t0 = performance.now();
        fetch(target + '?olcum=' + Date.now() + '-' + n, { cache: 'no-store', method: 'HEAD' })
          .then(function () { out.push(performance.now() - t0); })
          .catch(function () {})
          .then(function () {
            n++;
            if (n < 10) return next();
            runBtn.classList.remove('is-loading');
            if (!out.length) { meta.textContent = 'Ölçüm yapılamadı: bağlantı yok.'; return; }
            var s = out.slice().sort(function (a, b) { return a - b; });
            num.textContent = Math.max(1, Math.round(s[Math.floor(s.length / 2)]));
            var max = Math.max.apply(null, out);
            bars.innerHTML = out.map(function (v) { return '<i style="height:' + Math.max(5, v / max * 100).toFixed(0) + '%"></i>'; }).join('');
            meta.textContent = 'Önbelleksiz 10 istek · medyan · en iyi ' + Math.round(s[0]) + ' ms · en kötü ' + Math.round(s[s.length - 1]) + ' ms';
          });
      })();
    });
  }
})();
