// Start each newly opened page at its top, or at its #section. Some previews keep the
// previous page's scroll position, which dropped Book a trial at the bottom of Contact.
(function () {
  var nav = window.performance && performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (nav && nav.type !== 'navigate') return;
  function go() {
    var t = location.hash && document.getElementById(location.hash.slice(1));
    var root = document.documentElement, was = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    (t || document.body).scrollIntoView({ block: 'start' });
    root.style.scrollBehavior = was;
  }
  go();
  window.addEventListener('load', go);
})();

(function () {
  var form = document.getElementById('demo-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = document.getElementById('form-msg');
    var name = document.getElementById('f-name').value.trim();
    var gym = document.getElementById('f-gym').value.trim();
    var email = document.getElementById('f-email').value.trim();
    var city = document.getElementById('f-city').value.trim(), state = document.getElementById('f-state').value.trim();
    if (!name || !gym || !city || !state || !/^\S+@\S+\.\S+$/.test(email)) {
      msg.style.color = 'var(--deny)';
      msg.textContent = 'Add your name, gym name, city, state, and a valid email so we can reach you.';
    } else {
      window.mgfSend(form, 'Trial request: ' + gym, msg, name);
    }
    msg.hidden = false;
  });

  var contact = document.getElementById('contact-form');
  if (contact) contact.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = document.getElementById('contact-msg');
    var name = document.getElementById('c-name').value.trim();
    var email = document.getElementById('c-email').value.trim();
    var details = document.getElementById('c-msg').value.trim();
    if (!name || !details || !/^\S+@\S+\.\S+$/.test(email)) {
      msg.style.color = 'var(--deny)';
      msg.textContent = 'Add your name, a valid email and a few details so we can help.';
    } else {
      window.mgfSend(contact, 'Get help: ' + name, msg, name);
    }
    msg.hidden = false;
  });

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var people = ['Marcus D.', 'Taylor B.', 'Jordan M.', 'Casey R.', 'Riley P.', 'Sam K.'];
  var kinds = [['ok', 'In', 'Door code'], ['ok', 'In', 'App unlock'], ['ok', 'In', 'Keypad'], ['ok', 'In', 'Staff unlock'], ['deny', 'Refused', 'Membership expired'], ['ok', 'In', 'Front desk']];
  var log = document.getElementById('log');
  if (!log) return;
  var mins = 5 * 60 + 12, i = 0;
  function stamp(m) { var h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + ':' + (mm < 10 ? '0' : '') + mm + (h < 12 ? ' AM' : ' PM'); }
  setInterval(function () {
    if (!log.offsetParent) return;
    mins += 2 + Math.floor(Math.random() * 6);
    var k = kinds[i % kinds.length], p = people[i % people.length]; i++;
    var li = document.createElement('li');
    li.className = 'new';
    li.innerHTML = '<time>' + stamp(mins) + '</time><span class="who">' + p + '<span class="why">' + k[2] + '</span></span><span class="tag ' + k[0] + '">' + k[1] + '</span>';
    log.insertBefore(li, log.firstChild);
    if (log.children.length > 4) log.removeChild(log.lastElementChild);
  }, window.innerWidth < 640 ? 1500 : 1800);   // Brayden, 2026-10-24: "a bit faster" (was every 3s)
})();

// Sales alerts cycling over the Overview phone (wording follows the app's real alerts).
(function () {
  var stack = document.getElementById('notifs');
  if (!stack) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var alerts = [
    ['new sign-up', 'Priya Hargrove signed up for Unlimited Classes — $94.34'],
    ['shop purchase', 'Marcus Duarte bought Summit Fitness Tee (L) — $26.50'],
    ['plan change', 'Jordan Mercer changed plan to Annual Membership'],
    ['Flex reward', 'Owen Salazar redeemed Free Protein Shake for 500 points'],
    ['new sign-up', 'Kelsey Okafor signed up for Single Membership — $52.99'],
    ['guest pass', 'Tom Ferreira bought a guest pass for Alex — $10.60'],
    ['new sign-up', 'Mike Reyes signed up for Single Membership — $52.99'],
    ['plan change', 'Susie Fontaine changed plan to Family Membership']
  ];
  var i = 0;
  function card(a) {
    var el = document.createElement('div');
    el.className = 'notif';
    el.setAttribute('data-pos', 'enter');
    el.innerHTML = '<img src="img/logo.png" alt="" width="36" height="36"><div class="notif-text"><div class="notif-top"><b></b><time>now</time></div><p></p></div>';
    el.querySelector('b').textContent = 'Summit Fitness: ' + a[0];
    el.querySelector('p').textContent = a[1];
    return el;
  }
  setInterval(function () {
    if (document.hidden || !stack.offsetParent) return;
    var cards = Array.prototype.slice.call(stack.querySelectorAll('.notif'));
    var el = card(alerts[i % alerts.length]); i++;
    stack.appendChild(el);
    void el.offsetWidth;
    cards.forEach(function (c) {
      var p = c.getAttribute('data-pos');
      var times = c.querySelector('time');
      if (p === '0') { c.setAttribute('data-pos', '1'); times.textContent = '1m ago'; }
      else if (p === '1') { c.setAttribute('data-pos', '2'); }
      else { c.setAttribute('data-pos', 'gone'); setTimeout(function () { c.remove(); }, 700); }
    });
    el.setAttribute('data-pos', '0');
  }, 3000);
})();
// KS-START: the Key Features slider on How it works
// How it works "Key Features". Brayden: "a slide instead of boxes", "click through them with arrows".
// A rail of the nine feature names beside one big stage. The static HTML is a plain list of nine cards (readable without
// JS, no dead controls). This script builds the rail (dots under the stage on phones), the arrows, the pause/play
// button and a polite live region, and adds .ks-on. The arrows, keys and swipes go round (9 to 1), like the autoplay.
// Autoplay moves on every 3 s (2.5 s on phones; Brayden, 2026-10-24: "kinda slow") while the stage is on screen; it pauses while hovered, focused or touched, off screen or
// when the tab is hidden, stops for good once the visitor moves the slider themselves, and never runs under reduced motion.
// Nothing is measured: the layout is CSS only, so a page that starts hidden shows the right slide once shown. The rail
// and dots follow the slide count (--ks-n for ks.css), so the script works for any number of slides.
(function () {
  var roots = document.querySelectorAll('[data-ks]');
  for (var r = 0; r < roots.length; r++) init(roots[r]);

  function init(root) {
    var body = root.querySelector('.ks-body');
    var list = body && body.querySelector('.ks-slides');
    if (!list || root.classList.contains('ks-on')) return;
    var slides = [];
    for (var c = 0; c < list.children.length; c++) if (list.children[c].classList.contains('ks-slide')) slides.push(list.children[c]);
    var N = slides.length;
    if (N < 2) return;

    var phone = window.matchMedia ? window.matchMedia('(max-width: 639px)') : null;
    function dur() { return phone && phone.matches ? 2500 : 3000; }
    var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var reduced = !!(mq && mq.matches);
    var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5.5 8.5 12l6.5 6.5"/></svg>';

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
    function now() { return window.performance && performance.now ? performance.now() : Date.now(); }
    function wrap(n) { return (n % N + N) % N; }

    var names = slides.map(function (s, i) {
      var t = s.querySelector('.hx-title');
      return t ? t.textContent.replace(/\s+/g, ' ').trim() : 'Feature ' + (i + 1);
    });
    var labels = names.map(function (n, i) { return (i + 1) + ' of ' + N + ': ' + n; });

    // The section is the carousel region; it keeps its own name (the "Key Features" heading).
    if (!/^(SECTION|ASIDE|NAV)$/.test(root.tagName) && !root.hasAttribute('role')) root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carousel');
    if (!root.hasAttribute('aria-label') && !root.hasAttribute('aria-labelledby')) root.setAttribute('aria-label', 'Key features');

    list.setAttribute('role', 'none');
    slides.forEach(function (s, i) {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', labels[i]);
      var txt = s.querySelector('.hx-text');
      if (!txt) return;
      var cnt = el('span', 'ks-count', pad(i + 1) + ' / ' + pad(N));
      cnt.setAttribute('aria-hidden', 'true');
      txt.insertBefore(cnt, txt.firstChild);
    });

    // Rail of feature names (computers) / dots (phones): one set of buttons, styled per width. Each is named in plain
    // case ("Muscle map"), not from its upper-case text.
    var rail = el('div', 'ks-rail');
    rail.setAttribute('role', 'group');
    rail.setAttribute('aria-label', 'Choose a feature');
    var pos = names.map(function (n, i) {
      var b = el('button', 'ks-pos', '<span class="ks-n" aria-hidden="true"></span><span class="ks-name"></span><span class="ks-bar" aria-hidden="true"><i></i></span>');
      b.type = 'button';
      b.setAttribute('aria-label', n);
      b.querySelector('.ks-n').textContent = pad(i + 1);
      b.querySelector('.ks-name').textContent = n;
      rail.appendChild(b);
      return b;
    });
    var fills = pos.map(function (b) { return b.querySelector('.ks-bar i'); });

    var frame = el('div', 'ks-frame');
    frame.setAttribute('aria-hidden', 'true');
    var arrows = el('div', 'ks-arrows',
      '<button type="button" class="ks-arrow ks-prev" aria-label="Previous feature">' + CHEV + '</button>' +
      '<button type="button" class="ks-arrow ks-next" aria-label="Next feature">' + CHEV + '</button>');
    var prev = arrows.querySelector('.ks-prev'), next = arrows.querySelector('.ks-next');
    var live = el('div', 'ks-sr');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');

    var play = el('button', 'ks-play',
      '<svg class="ks-i-pause" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>' +
      '<svg class="ks-i-play" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z"/></svg>');
    play.type = 'button';
    var head = root.querySelector('.ks-head');

    body.insertBefore(rail, body.firstChild);
    body.insertBefore(frame, list);
    body.appendChild(arrows);
    body.appendChild(live);
    if (head) head.appendChild(play); else body.insertBefore(play, body.firstChild);

    // Tab order follows the layout: on computers the rail comes before the arrows; on phones (ks.css < 720 px) the
    // dots sit between Prev and Next, so they go between them in the page too (.ks-arrows is the controls row there).
    var narrow = window.matchMedia ? window.matchMedia('(max-width: 719px)') : null;
    function placeRail() {
      var inArrows = rail.parentNode === arrows;
      var want = !!(narrow && narrow.matches);
      if (inArrows === want) return;
      var had = rail.contains(document.activeElement) ? document.activeElement : null;
      if (want) arrows.insertBefore(rail, next); else body.insertBefore(rail, body.firstChild);
      if (had) had.focus();
    }
    placeRail();
    if (narrow) { if (narrow.addEventListener) narrow.addEventListener('change', placeRail); else if (narrow.addListener) narrow.addListener(placeRail); }

    // mode: 'auto' (playing when allowed), 'paused' (pause button; the bar holds where it was),
    // 'stopped' (the visitor moved the slider, or reduced motion; the current bar shows full).
    var cur = -1, mode = reduced ? 'stopped' : 'auto', elapsed = 0, last = 0, raf = 0, running = false;
    var hover = false, focused = false, touching = false, inView = !('IntersectionObserver' in window);
    // The pause / play button holds the autoplay too while it is hovered or focused, until it is pressed: after that the
    // visitor's choice wins at once, even with the pointer or focus still on it.
    var playHover = false, playFocus = false, playUsed = false;
    var rAF = window.requestAnimationFrame || function (f) { return setTimeout(function () { f(now()); }, 16); };
    var cAF = window.cancelAnimationFrame || clearTimeout;

    function paint() {
      var p = mode === 'stopped' ? 1 : Math.max(0, Math.min(1, elapsed / dur()));
      for (var k = 0; k < N; k++) fills[k].style.transform = 'scaleX(' + (k === cur ? p : 0) + ')';
    }

    // dir: 1 = the new slide comes in from the right (forward), -1 = from the left
    function show(n, dir) {
      if (n === cur || n < 0 || n >= N) return;
      var was = cur;
      if (was >= 0) {
        root.style.setProperty('--ks-dir', String(dir || (n > was ? 1 : -1)));
        void list.offsetWidth;   // start the entering slide from the new side
      }
      cur = n;
      for (var k = 0; k < N; k++) {
        var on = k === n;
        slides[k].classList.toggle('is-on', on);
        slides[k].classList.toggle('is-out', k === was && !on);
        if (on) { slides[k].removeAttribute('aria-hidden'); slides[k].removeAttribute('inert'); slides[k].inert = false; }
        else { slides[k].setAttribute('aria-hidden', 'true'); slides[k].setAttribute('inert', ''); slides[k].inert = true; }
        pos[k].classList.toggle('is-on', on);
        if (on) pos[k].setAttribute('aria-current', 'true'); else pos[k].removeAttribute('aria-current');
        pos[k].tabIndex = on ? 0 : -1;
      }
      root.setAttribute('data-ks-at', String(n + 1));
      elapsed = 0;
      paint();
    }

    function setPlay() {
      var on = mode === 'auto';
      if (on) play.removeAttribute('data-paused'); else play.setAttribute('data-paused', '');
      play.setAttribute('aria-label', on ? 'Pause the slideshow' : 'Play the slideshow');
      play.hidden = reduced;
    }

    function canRun() {
      return mode === 'auto' && !reduced && !hover && !focused && !touching && !((playHover || playFocus) && !playUsed) && inView && !document.hidden;
    }

    function frameTick() {
      var t = now();
      elapsed += Math.min(100, Math.max(0, t - last));
      last = t;
      if (elapsed >= dur()) { show(wrap(cur + 1), 1); live.textContent = ''; }   // never announced; drop an old announcement
      else paint();
      raf = rAF(frameTick);
    }

    function sync() {
      var can = canRun();
      if (can && !running) { running = true; last = now(); raf = rAF(frameTick); }
      else if (!can && running) { running = false; cAF(raf); }
      root.classList.toggle('ks-running', running);
      paint();
    }

    // The visitor moved the slider: autoplay stops for good (the play button can start it again).
    function stop() {
      if (mode !== 'stopped') { mode = 'stopped'; setPlay(); }
      sync();
    }
    // quiet: focus is moving onto the new name, which already names it, so the live region stays silent
    function go(n, dir, quiet) {
      stop();
      if (n < 0 || n >= N || n === cur) return;
      show(n, dir);
      live.textContent = quiet ? '' : labels[n];
    }
    function step(d, quiet) { go(wrap(cur + d), d, quiet); }

    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    pos.forEach(function (b, k) { b.addEventListener('click', function () { go(k); }); });
    play.addEventListener('click', function () {
      if (mode === 'auto') mode = 'paused';
      else { if (mode === 'stopped') elapsed = 0; mode = 'auto'; }
      playUsed = true;
      live.textContent = '';   // the last manual announcement no longer matches the slide once autoplay moves on
      setPlay();
      sync();
    });

    // Left/Right anywhere in the slider; Up/Down/Home/End on the rail too (focus follows the current name).
    root.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) return;
      var k = e.key, onPos = pos.indexOf(e.target) >= 0;
      if (k === 'ArrowRight' || k === 'Right' || (onPos && (k === 'ArrowDown' || k === 'Down'))) step(1, onPos);
      else if (k === 'ArrowLeft' || k === 'Left' || (onPos && (k === 'ArrowUp' || k === 'Up'))) step(-1, onPos);
      else if (onPos && k === 'Home') go(0, -1, true);
      else if (onPos && k === 'End') go(N - 1, 1, true);
      else return;
      e.preventDefault();
      if (onPos) pos[cur].focus();
    });

    // Pause while a mouse is over the rail, stage or pause button, or focus is inside the slider (the pause button holds
    // it only until it is pressed, see playUsed).
    body.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hover = true; sync(); } });
    body.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hover = false; sync(); } });
    play.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { playHover = true; sync(); } });
    play.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      playHover = false;
      if (!playFocus) playUsed = false;
      sync();
    });
    // Focus on the section's heading is not someone using the slider: the preview moves focus there when it opens the
    // page, which used to hold the slideshow until the next tap somewhere else.
    function holds(t) { return !!t && t !== play && root.contains(t) && !/^H[1-6]$/.test(t.tagName); }
    root.addEventListener('focusin', function (e) { playFocus = e.target === play; focused = holds(e.target); sync(); });
    root.addEventListener('focusout', function (e) {
      var to = e.relatedTarget;
      playFocus = to === play;
      focused = holds(to);
      if (!playFocus && !playHover) playUsed = false;
      sync();
    });

    // Swipe on the stage (phones). The graphic leans with the finger; a 40 px swipe moves one slide. A second finger
    // anywhere on the screen (a pinch, or two fingers dragging) cancels it, even when it lands outside the stage.
    // Autoplay holds while a finger is on the stage, so a swipe always counts from the slide it started on.
    var sx = 0, sy = 0, dx = 0, axis = '', tracking = false;
    function lean(x) {
      if (!x) {
        root.classList.remove('ks-dragging');
        for (var k = 0; k < N; k++) slides[k].style.removeProperty('--ks-drag');
        return;
      }
      if (reduced) return;
      root.classList.add('ks-dragging');
      slides[cur].style.setProperty('--ks-drag', (x * 0.25).toFixed(1) + 'px');
    }
    list.addEventListener('touchstart', function (e) {
      if (!touching) { touching = true; sync(); }
      tracking = e.touches.length === 1;
      if (!tracking) { lean(0); return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; axis = '';
    }, { passive: true });
    list.addEventListener('touchmove', function (e) {
      if (!tracking) return;
      if (e.touches.length > 1) { tracking = false; lean(0); return; }
      var x = e.touches[0].clientX - sx, y = e.touches[0].clientY - sy;
      if (!axis && (Math.abs(x) > 8 || Math.abs(y) > 8)) axis = Math.abs(x) > Math.abs(y) ? 'x' : 'y';
      if (axis === 'x') { dx = x; lean(x); }
    }, { passive: true });
    function release() { if (touching) { touching = false; sync(); } }
    function endTouch(e) {
      if (!tracking) { release(); return; }
      tracking = false;
      lean(0);
      touching = false;
      if (e.touches.length) { sync(); return; }   // another finger is still down: not a swipe
      if (axis === 'x' && Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
      else if (axis === 'x' && Math.abs(dx) > 12) stop();
      else sync();
    }
    list.addEventListener('touchend', endTouch, { passive: true });
    list.addEventListener('touchcancel', function () { tracking = false; lean(0); release(); }, { passive: true });

    // Two-finger sideways scroll on a trackpad: one move per gesture (its momentum tail is ignored).
    var wsum = 0, wlock = false, wtimer = 0;
    list.addEventListener('wheel', function (e) {
      var x = e.deltaX, y = e.deltaY;
      if (e.deltaMode === 1) { x *= 16; y *= 16; }
      if (Math.abs(x) <= Math.abs(y)) return;
      e.preventDefault();
      clearTimeout(wtimer);
      wtimer = setTimeout(function () { wlock = false; wsum = 0; }, 240);
      if (wlock) return;
      wsum += x;
      if (Math.abs(wsum) >= 50) { wlock = true; step(wsum > 0 ? 1 : -1); wsum = 0; }
    }, { passive: false });

    document.addEventListener('visibilitychange', sync);
    if (!inView) {
      // Also reports "not intersecting" while the preview keeps the page hidden.
      new IntersectionObserver(function (entries) {
        var e = entries[entries.length - 1];
        inView = e.isIntersecting && e.intersectionRatio >= 0.3;
        sync();
      }, { threshold: [0, 0.3, 0.6] }).observe(body);
    }
    if (mq) {
      var onPref = function () {
        reduced = mq.matches;
        if (reduced) mode = 'stopped';
        root.classList.toggle('ks-still', reduced);
        setPlay();
        sync();
      };
      if (mq.addEventListener) mq.addEventListener('change', onPref); else if (mq.addListener) mq.addListener(onPref);
    }

    // Switch on with transitions off, so nothing slides in on load.
    root.style.setProperty('--ks-n', String(N));
    root.classList.add('ks-boot', 'ks-on');
    root.classList.toggle('ks-still', reduced);
    show(0);
    setPlay();
    sync();
    rAF(function () { rAF(function () { root.classList.remove('ks-boot'); }); });
  }
})();
// KS-END
// SW-START: the moving Call, Set up, Install, Invite graphic on the home page
// Home page "Switching over": steps through Call > Set up > Install > Invite and loops.
// One timer for the whole section. It only runs while the tab is visible, the section is rendered and on screen,
// the visitor has not paused it, and reduced motion is off. CSS plays each scene; .sw-paused freezes it in place and
// .sw-still shows it finished (before the loop first runs, after the page was hidden, or after a click while paused).
(function () {
  var sec = document.querySelector('section.hm-switch');
  if (!sec) return;
  var track = sec.querySelector('.sw-track'), stage = sec.querySelector('.sw-stage');
  if (!track || !stage) return;

  var steps = Array.prototype.slice.call(track.querySelectorAll('.sw-step'));
  var scenes = Array.prototype.slice.call(stage.querySelectorAll('.sw-scene'));
  var play = sec.querySelector('.sw-play');
  var N = steps.length, DUR = 2800;
  if (!N || scenes.length !== N) return;
  for (var j = 0; j < N; j++) if (!steps[j].querySelector('.sw-name')) return;

  var CHECK = '<svg class="fq-ic sw-chk" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  // The static HTML has plain <h3> labels (no dead controls without JS). Put a button inside each heading;
  // its ::after overlay makes the whole column the click target. A done step's node swaps its icon for a check.
  var tabs = steps.map(function (li) {
    var h = li.querySelector('.sw-name'), node = li.querySelector('.sw-node');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sw-tab';
    Array.prototype.slice.call(h.childNodes).forEach(function (c) {
      if (!(c.nodeType === 1 && c.classList.contains('sw-num'))) b.appendChild(c);
    });
    h.appendChild(b);
    if (node) node.insertAdjacentHTML('beforeend', CHECK);
    return b;
  });

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);
  var cur = -1, elapsed = 0, since = 0, timer = 0, running = false, held = false;
  var fresh = true;   // the active scene shows finished (.sw-still) and plays from its start when the loop next runs
  // Start right away when the section is already on screen at load, so the finished Call scene never flashes
  // for a frame before the observer's first report (the observer corrects this either way).
  var inView = !('IntersectionObserver' in window) || (function () {
    var r = sec.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
    return r.height > 0 && (Math.min(r.bottom, vh) - Math.max(r.top, 0)) / r.height >= 0.2;
  })();

  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }

  function show(n) {
    var was = cur;
    cur = n;
    sec.setAttribute('data-step', String(n + 1));
    sec.style.setProperty('--sw-i', n);
    for (var k = 0; k < N; k++) {
      steps[k].classList.toggle('is-on', k === n);
      steps[k].classList.toggle('is-done', k < n);
      if (k === n) tabs[k].setAttribute('aria-current', 'step'); else tabs[k].removeAttribute('aria-current');
      scenes[k].classList.toggle('is-on', k === n);
      scenes[k].classList.toggle('is-prev', k === was && k !== n);
    }
  }

  // Show the active scene finished; the next run starts it (and its fill) from the beginning with a full stage time.
  function settle() {
    fresh = true;
    elapsed = 0;
    sec.classList.add('sw-still');
  }

  function rendered() { return sec.offsetParent !== null; }
  function canRun() { return !reduced && !held && !document.hidden && inView && rendered(); }

  function sync() {
    var go = canRun();
    if (go !== running) {
      running = go;
      if (go) {
        if (fresh) { fresh = false; elapsed = 0; sec.classList.remove('sw-still'); }
        since = now();
        timer = setTimeout(tick, Math.max(0, DUR - elapsed));
      } else {
        clearTimeout(timer);
        elapsed += now() - since;
      }
      sec.classList.toggle('sw-paused', !go);
      if (!go) void sec.offsetWidth;   // apply the pause now, even in a background tab, so CSS and the timer stay in step
    }
    // Gone (display:none on the section or an ancestor): the browser drops the CSS animations and restarts them when
    // it shows the page again, so leftover time would make the next step come early. Start this scene over instead.
    if (!rendered() && !fresh) settle();
  }

  function tick() {
    show((cur + 1) % N);
    elapsed = 0;
    since = now();
    timer = setTimeout(tick, DUR);
  }

  tabs.forEach(function (tab, k) {
    tab.addEventListener('click', function () {
      if (k === cur) return;
      show(k);
      if (running) { clearTimeout(timer); elapsed = 0; since = now(); timer = setTimeout(tick, DUR); }
      else settle();   // not playing: show the new scene finished, not frozen at its first keyframe
    });
  });

  if (play) play.addEventListener('click', function () {
    held = !held;
    if (held) play.setAttribute('data-paused', '');
    else play.removeAttribute('data-paused');
    play.setAttribute('aria-label', held ? 'Play the steps animation' : 'Pause the steps animation');
    sync();
  });

  function setMode() {
    sec.classList.toggle('sw-motion', !reduced);
    if (play) play.hidden = reduced;
    sync();
  }

  // Switch everything on with transitions off, so the connector lines and labels don't animate under the hero on load.
  sec.classList.add('sw-boot');
  sec.classList.add('sw-js', 'sw-paused', 'sw-still');
  sec.style.setProperty('--sw-dur', DUR + 'ms');
  show(0);
  setMode();
  void sec.offsetWidth;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  raf(function () { raf(function () { sec.classList.remove('sw-boot'); }); });

  document.addEventListener('visibilitychange', sync);
  if (mq) {
    var onPref = function () { reduced = mq.matches; setMode(); };
    if (mq.addEventListener) mq.addEventListener('change', onPref); else if (mq.addListener) mq.addListener(onPref);
  }
  if (!inView) {
    // Fires on scroll in/out, and when the preview hides or shows the whole page (no box = not intersecting).
    new IntersectionObserver(function (entries) {
      var e = entries[entries.length - 1];
      inView = e.isIntersecting && e.intersectionRatio >= 0.2;
      sync();
    }, { threshold: [0, 0.2, 0.5] }).observe(sec);
  }
  // Catches the page being hidden while the loop was already stopped (off screen or paused): the size drops to 0.
  if ('ResizeObserver' in window) new ResizeObserver(function () { sync(); }).observe(sec);
})();
// SW-END
// TU-START: the Tap to unlock phone on the home page
// Home page "Tap to unlock" (Brayden: "this needs to be a focal point on the main page"): taps the drawn Unlock Gym
// button on a loop. Runs only while the section is on screen, the page is shown and the tab is visible; never under
// reduced motion (the CSS then shows the unlocked moment, still).
(function () {
  var stage = document.querySelector('.tu-stage');
  if (!stage) return;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  if (mq && mq.matches) return;
  stage.classList.add('tu-live');
  var inView = !('IntersectionObserver' in window), timers = [], running = false;
  function clear() { for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]); timers = []; }
  function at(ms, f) { timers.push(setTimeout(f, ms)); }
  function cycle() {
    stage.classList.remove('is-open', 'is-tap');
    at(900, function () { stage.classList.add('is-tap'); });
    at(1150, function () { stage.classList.add('is-open'); });
    at(3300, function () { stage.classList.remove('is-open', 'is-tap'); });
    at(4000, cycle);
  }
  function sync() {
    var go = inView && !document.hidden && stage.offsetParent !== null;
    if (go === running) return;
    running = go;
    clear();
    stage.classList.remove('is-open', 'is-tap');
    if (go) cycle();
  }
  if (!inView) new IntersectionObserver(function (e) { inView = e[e.length - 1].isIntersecting; sync(); }, { threshold: 0.35 }).observe(stage);
  document.addEventListener('visibilitychange', sync);
  if ('ResizeObserver' in window) new ResizeObserver(sync).observe(stage);
  sync();
})();
// TU-END
// FA-START: the Exercise your faith verses on the home page
// FA: Brayden, "exercise your faith ... just make it simple". Home page verse of the week strip.
// The static HTML shows verse 1 with its reference (the other three are hidden), so without JS nothing is dead.
// This script unhides the four verses (CSS stacks them in one cell, so the height never jumps), builds the dots and the
// pause / play button, and moves on every 6 s with a soft crossfade. It pauses while the mouse is over the verses or
// dots, while keyboard focus is inside (until Play is pressed), while the verses are off screen or the page / tab is hidden, and when paused
// with the button. A dot shows that verse and the 6 s count starts again from there. Under prefers-reduced-motion it
// never moves on its own (verse 1, dots still work, no fade). Verses are not announced while autoplaying (aria-live
// off); after a dot is used the stage is polite.
(function () {
  var root = document.querySelector('section.fa');
  if (!root || root.classList.contains('fa-on')) return; // already set up (the script ran twice)
  var stage = root.querySelector('.fa-stage');
  var show = root.querySelector('.fa-show');
  var verses = root.querySelectorAll('.fa-verse');
  var n = verses.length;
  if (!stage || !show || n < 2) return;

  var DELAY = 3500;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);
  var cur = 0, userPaused = false, hover = false, focused = false, ptrAt = 0;
  var inView = !('IntersectionObserver' in window);
  var timer = null, running = false, left = DELAY, startedAt = 0;
  var i;

  function make(tag, cls, html) {
    var e = document.createElement(tag);
    e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }

  // Controls: one dot per verse (labelled with its reference), then the pause / play button
  var controls = make('div', 'fa-controls');
  var group = make('div', 'fa-dots');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Choose a verse');
  var dots = [];
  for (i = 0; i < n; i++) {
    var d = make('button', 'fa-dot');
    d.type = 'button';
    d.setAttribute('aria-label', verses[i].getAttribute('data-ref') || ('Verse ' + (i + 1)));
    d.setAttribute('data-i', i);
    group.appendChild(d);
    dots.push(d);
  }
  var play = make('button', 'fa-play',
    '<svg class="fa-i-pause" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6" y="4.5" width="4.2" height="15" rx="1.2"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2"/></svg>' +
    '<svg class="fa-i-play" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.5 5.3v13.4a1 1 0 0 0 1.52.85l10.6-6.7a1 1 0 0 0 0-1.7L9.02 4.45A1 1 0 0 0 7.5 5.3z"/></svg>');
  play.type = 'button';
  controls.appendChild(group);
  controls.appendChild(play);
  show.appendChild(controls);

  for (i = 0; i < n; i++) verses[i].hidden = false;
  stage.setAttribute('aria-live', 'off');
  root.classList.add('fa-on');

  function render(k) {
    cur = (k + n) % n;
    for (var j = 0; j < n; j++) {
      verses[j].classList.toggle('fa-cur', j === cur);
      if (j === cur) dots[j].setAttribute('aria-current', 'true');
      else dots[j].removeAttribute('aria-current');
    }
  }

  function setPlay() {
    if (userPaused) play.setAttribute('data-paused', '');
    else play.removeAttribute('data-paused');
    play.setAttribute('aria-label', userPaused ? 'Play the verses' : 'Pause the verses');
    play.hidden = reduced;
  }

  function onScreen() {
    return !document.hidden && root.getClientRects().length > 0;
  }

  function tick() {
    timer = null;
    running = false;
    left = DELAY;
    // Straight after a dot was used the stage is still polite: switch it off first and move on a moment later, so a
    // screen reader never sees the autoplay change while the region is live
    if (stage.getAttribute('aria-live') !== 'off') {
      stage.setAttribute('aria-live', 'off');
      left = 60;
      startedAt = Date.now();
      timer = setTimeout(tick, left);
      running = true;
      return;
    }
    render(cur + 1);
    sync();
  }

  // Start or stop the countdown to match the current state. A stop keeps what was left, so a short hover does not
  // reset the pace; a restart always leaves at least a moment to finish reading.
  function sync() {
    var go = !reduced && !userPaused && !hover && !focused && inView && onScreen();
    if (go && !running) {
      if (left < 1500) left = 1500;
      startedAt = Date.now();
      timer = setTimeout(tick, left);
      running = true;
    } else if (!go && running) {
      clearTimeout(timer);
      timer = null;
      running = false;
      left -= Date.now() - startedAt;
    }
  }

  // A visitor picked a verse: show it, announce it politely, and give it a full 6 s before the next one
  function pick(k) {
    if (running) { clearTimeout(timer); timer = null; running = false; }
    left = DELAY;
    stage.setAttribute('aria-live', 'polite');
    render(k);
    sync();
  }

  // Make the stage polite as soon as a visitor reaches for a dot (press or focus), a step before the verse changes, so
  // screen readers already treat it as live when the picked verse appears. An autoplay step turns it off again first.
  function politeSoon() { stage.setAttribute('aria-live', 'polite'); }
  group.addEventListener('pointerdown', politeSoon);
  group.addEventListener('focusin', politeSoon);
  group.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.fa-dot') : null;
    if (b) pick(+b.getAttribute('data-i'));
  });
  // Arrow keys step from the dot that has focus (Tab can move focus without changing the verse)
  group.addEventListener('keydown', function (e) {
    var k = e.key, to = null;
    var b = e.target.closest ? e.target.closest('.fa-dot') : null;
    var at = b ? +b.getAttribute('data-i') : cur;
    if (k === 'ArrowRight' || k === 'ArrowDown') to = at + 1;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') to = at - 1;
    else if (k === 'Home') to = 0;
    else if (k === 'End') to = n - 1;
    if (to === null) return;
    e.preventDefault();
    pick(to);
    dots[cur].focus();
  });

  // Play always resumes at once, even while keyboard focus stays on the button
  play.addEventListener('click', function () {
    userPaused = !userPaused;
    if (!userPaused) { left = DELAY; focused = false; }
    setPlay();
    sync();
  });

  // Hover: a mouse or pen over the verses or the dots (not over the pause / play button, so Play works at once).
  // Touch never counts, so a tap does not leave it stuck paused.
  if (window.PointerEvent) {
    show.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'touch') return;
      hover = !play.contains(e.target);
      sync();
    });
    show.addEventListener('pointerleave', function () { hover = false; sync(); });
  }

  // Focus: keyboard focus anywhere inside the strip (the pause / play button too) pauses it. Focus from a click or a
  // tap does not: the hover rule covers the mouse, and a tap must never leave it stuck paused. :focus-visible tells
  // the two apart; where it is not supported, focus within a second of a pointer press counts as pointer focus.
  function byKeys(el) {
    try { return el.matches(':focus-visible'); } catch (x) { return Date.now() - ptrAt > 1000; }
  }
  root.addEventListener('pointerdown', function () { ptrAt = Date.now(); }, true);
  document.addEventListener('keydown', function () { ptrAt = 0; }, true);
  root.addEventListener('focusin', function (e) {
    focused = byKeys(e.target);
    sync();
  });
  root.addEventListener('focusout', function (e) {
    var to = e.relatedTarget;
    if (!to || !root.contains(to)) { focused = false; sync(); }
  });

  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var en = entries[entries.length - 1];
      inView = en.isIntersecting && en.intersectionRatio >= 0.5;
      sync();
    }, { threshold: [0, 0.5, 1] }).observe(stage);
  }
  if (mq) {
    var onMotion = function () { reduced = mq.matches; setPlay(); sync(); };
    if (mq.addEventListener) mq.addEventListener('change', onMotion);
    else if (mq.addListener) mq.addListener(onMotion);
  }

  render(0);
  setPlay();
  sync();
})();
// FA-END
// RF-START: the Contact page's switch and referral form
(function () {
  var form = document.getElementById('refer-form');
  if (!form) return;
  // Brayden: picking "Other" under "How do you know them?" opens a box they have to fill in.
  var how = document.getElementById('r-how'), otherWrap = document.getElementById('r-other-wrap'), other = document.getElementById('r-other');
  function syncOther() {
    var on = how.value === 'Other';
    otherWrap.hidden = !on;
    other.required = on;
    if (on && document.activeElement === how) other.focus();
  }
  how.addEventListener('change', syncOther);
  syncOther();
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = document.getElementById('refer-msg');
    function v(id) { return document.getElementById(id).value.trim(); }
    var ok = /^\S+@\S+\.\S+$/;
    var missing = !v('r-name') || !ok.test(v('r-email')) || !v('r-gym') || !v('r-city') || !v('r-owner') || !ok.test(v('r-oemail')) || !v('r-how');
    var noOther = v('r-how') === 'Other' && !v('r-other');
    if (missing || noOther) {
      msg.style.color = 'var(--deny)';
      msg.textContent = missing ? 'Add your name and email, the gym, its city and state, the owner\u2019s name and email, and how you know them.' : 'Tell us how you know them.';
      if (!missing) other.focus();
    } else {
      window.mgfSend(form, 'Gym referral: ' + v('r-gym'), msg, v('r-name'));
    }
    msg.hidden = false;
  });
})();

// Contact: the two-way switch above the forms (Get help / Refer a gym). Opens on the referral when the link ends in #refer.
(function () {
  var sw = document.getElementById('cf-switch');
  if (!sw) return;
  var tabs = Array.prototype.slice.call(sw.querySelectorAll('[role="tab"]'));
  function show(id, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('aria-controls') === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      if (on && focus) t.focus();
    });
  }
  sw.addEventListener('click', function (e) {
    var t = e.target.closest('[role="tab"]');
    if (t) show(t.getAttribute('aria-controls'));
  });
  sw.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    show(tabs[(i + 1) % tabs.length].getAttribute('aria-controls'), true);
  });
  sw.hidden = false;
  sw.parentNode.classList.add('cf-on');
  show(location.hash === '#refer' ? 'refer' : 'cf-help');
})();
// RF-END
// MX-START: the Manage page's tiles that open on click
// Manage page, "Also on the Manage tab": each tile lights up on hover and opens a short extra line on click.
// The static HTML shows every extra line (nothing is lost without JS). Here each tile's title becomes a button that
// toggles its line; the button's overlay makes the whole tile the click target.
(function () {
  var list = document.querySelector('.mng-feats');
  if (!list) return;
  var tiles = Array.prototype.slice.call(list.querySelectorAll('.mng-feat'));
  tiles.forEach(function (li, n) {
    var h = li.querySelector('h3'), x = li.querySelector('.mng-x');
    if (!h || !x) return;
    var wrap = document.createElement('div');
    wrap.className = 'mng-x-wrap';
    x.parentNode.insertBefore(wrap, x);
    wrap.appendChild(x);
    x.id = x.id || 'mng-x-' + (n + 1);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mng-feat-btn';
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', x.id);
    while (h.firstChild) b.appendChild(h.firstChild);
    h.appendChild(b);
    x.setAttribute('aria-hidden', 'true');
    b.addEventListener('click', function () {
      var open = !li.classList.contains('is-open');
      li.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      x.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
  });
  // Back-up for :hover (Brayden saw no highlight three times): light the tile under the mouse from mouseover on the whole
  // list, which every browser fires, and flash a tile on touch.
  function hot(li) { tiles.forEach(function (t) { t.classList.toggle('is-hot', t === li); }); }
  list.addEventListener('mouseover', function (e) { hot(e.target.closest ? e.target.closest('.mng-feat') : null); });
  list.addEventListener('mouseleave', function () { hot(null); });
  list.addEventListener('touchstart', function (e) { hot(e.target.closest ? e.target.closest('.mng-feat') : null); }, { passive: true });
  list.addEventListener('touchend', function () { setTimeout(function () { hot(null); }, 220); });
  list.classList.add('mng-feats-js');
})();
// MX-END
// MB-START: the top bar hides while scrolling down
/* Top bar: hides while scrolling down, comes back on any scroll up or when a link in it gets focus */
(function () {
  var nav = document.querySelector('header.nav');
  if (!nav) return;
  var lastY = window.scrollY || 0, ticking = false;
  // a jump to a spot on the same page (FAQ topic chips, Leave a review) keeps the bar showing while the page glides there;
  // the visitor's own wheel, touch or scroll keys end the hold
  var holdUntil = 0;
  function hold(ms) { holdUntil = ms ? Date.now() + ms : 0; if (ms) nav.classList.remove('nav-away'); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"], [data-go^="#"]');
    if (a && !nav.contains(a) && (a.hasAttribute('data-go') || a.pathname === location.pathname)) hold(1500);
  }, true);
  window.addEventListener('scrollend', function () { if (holdUntil) { hold(0); lastY = Math.max(0, window.scrollY || 0); } });
  ['wheel', 'touchstart'].forEach(function (t) { window.addEventListener(t, function () { hold(0); }, { passive: true }); });
  window.addEventListener('keydown', function (e) { if (/^(Arrow|Page|Home|End| )/.test(e.key)) hold(0); });
  // only keyboard focus in the bar keeps it showing; a button left focused by a tap or click doesn't
  function kbFocus() { try { return !!nav.querySelector(':focus-visible'); } catch (e) { return nav.contains(document.activeElement); } }
  function update() {
    ticking = false;
    // iPhones report a scroll past the bottom while the page bounces; capping it keeps the spring-back from reading as a scroll up
    var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var y = Math.min(max, Math.max(0, window.scrollY || 0)), dy = y - lastY;
    if (nav.classList.contains('menu-open') || Date.now() < holdUntil) { lastY = y; return; }
    if (y <= nav.offsetHeight) { nav.classList.remove('nav-away'); lastY = y; return; }
    if (dy > 8) { if (!kbFocus()) nav.classList.add('nav-away'); lastY = y; }
    else if (dy < -8) { nav.classList.remove('nav-away'); lastY = y; }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  nav.addEventListener('focusin', function () { nav.classList.remove('nav-away'); });
})();

/* Brayden, 2026-10-20: the tabs live behind a three-line menu button and pop up when it is tapped.
   Closes on picking a tab, tapping outside, Escape or the X. Hover tints by class too (his viewer misses :hover). */
(function () {
  var nav = document.querySelector('header.nav');
  var btn = nav && nav.querySelector('.nav-menu'), menu = nav && nav.querySelector('.nav-links');
  if (!btn || !menu) return;
  // apply the closed menu at once, without its fade, so it doesn't flash open on every page load
  menu.style.transition = 'none';
  nav.classList.add('js-menu');
  void getComputedStyle(menu).opacity;
  menu.style.removeProperty('transition');
  function isOpen() { return nav.classList.contains('menu-open'); }
  function set(open, focusBtn) {
    nav.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open && focusBtn) btn.focus();
  }
  btn.addEventListener('click', function () { set(!isOpen()); });
  // any link in the bar (a tab, the logo, Book a trial) closes the menu; so does the preview switching pages (Back, Forward)
  nav.addEventListener('click', function (e) { if (isOpen() && e.target.closest && e.target.closest('a')) set(false); });
  nav.addEventListener('keydown', function (e) { if (e.key === 'Enter' && isOpen() && e.target.closest && e.target.closest('a')) set(false); });
  window.addEventListener('hashchange', function () { if (isOpen()) set(false); });
  window.addEventListener('popstate', function () { if (isOpen()) set(false); });
  // keyboard: Tab from the open menu button goes into the menu, and focus leaving the bar closes it
  btn.addEventListener('keydown', function (e) {
    if (e.key === 'Tab' && !e.shiftKey && isOpen()) { var f = menu.querySelector('a'); if (f) { e.preventDefault(); f.focus(); } }
  });
  nav.addEventListener('focusout', function (e) { if (isOpen() && e.relatedTarget && !nav.contains(e.relatedTarget)) set(false); });
  document.addEventListener('click', function (e) { if (isOpen() && !nav.contains(e.target)) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) set(false, true); });
  // computers show the tab row instead (mb.css), so a menu left open closes when the window grows past the menu width
  var wide = window.matchMedia && window.matchMedia('(min-width: 1024px)');
  if (wide) { var onWide = function () { if (wide.matches && isOpen()) set(false); if (!wide.matches) { menu.style.transition = 'none'; void menu.offsetWidth; requestAnimationFrame(function () { menu.style.removeProperty('transition'); }); } }; wide.addEventListener ? wide.addEventListener('change', onWide) : wide.addListener(onWide); }
  function hot(el) {
    [].forEach.call(nav.querySelectorAll('.nav-links a, .nav-cta .btn'), function (x) { x.classList.toggle('is-hot', x === el); });
    btn.classList.toggle('is-hot', el === btn);
  }
  // a tap also sends mouseover; skip those so a tapped button doesn't stay lit after the menu closes
  var touchedAt = 0;
  nav.addEventListener('touchstart', function () { touchedAt = Date.now(); hot(null); }, { passive: true });
  nav.addEventListener('mouseover', function (e) { if (Date.now() - touchedAt < 1000) return; hot(e.target.closest ? e.target.closest('.nav-links a, .nav-cta .btn, .nav-menu') : null); });
  nav.addEventListener('mouseleave', function () { hot(null); });
  window.__mbReady = true;
})();
// MB-END
// FE-START: store buttons light up on hover
/* the App Store and Google Play buttons, and the page buttons, light up under the mouse (a tap doesn't leave them lit; the header has its own) */
(function () {
  var tapAt = 0;
  document.addEventListener('touchstart', function () { tapAt = Date.now(); }, { passive: true, capture: true });
  [].forEach.call(document.querySelectorAll('.dl-store, .btn'), function (a) {
    if (a.closest('header.nav')) return;
    a.addEventListener('mouseenter', function () { if (Date.now() - tapAt > 1000) a.classList.add('is-hot'); });
    a.addEventListener('mouseleave', function () { a.classList.remove('is-hot'); });
  });
})();
// FE-END
// FM-START: forms send to registration@mygymfitness.us
(function () {
  // Brayden, 2026-10-21: "can you make the "get help" and "Refer a gym, get $500" send to registration@mygymfitness.us",
  // then on the decision cards: FormSubmit, and Book a trial to the same inbox. The site is static, so the three forms post
  // through FormSubmit (formsubmit.co). Its first message sends a one-time "Activate" email to the inbox; after that every
  // form lands there. The preview never sends anything.
  var TO = 'registration@mygymfitness.us';
  window.mgfSend = function (form, subject, msg, name) {
    var btn = form.querySelector('button[type="submit"]');
    function say(color, text) { msg.style.color = color; msg.textContent = text; msg.hidden = false; }
    if (document.querySelector('[data-page]') || location.protocol === 'file:') {
      say('var(--ok)', 'Thanks, ' + name + '. On the live site this goes to ' + TO + '. This preview does not send it.');
      return;
    }
    var data = {};
    new FormData(form).forEach(function (v, k) { v = String(v).trim(); if (v) data[k] = v; });
    if (data._honey) { say('var(--ok)', 'Thanks, ' + name + '. We got it.'); return; }   // only a bot fills the hidden field
    var reply = data.email || data.your_email;
    if (reply) data._replyto = reply;
    data._subject = subject; data._template = 'table'; data._captcha = 'false';
    if (btn) { btn.disabled = true; btn.setAttribute('data-label', btn.textContent); btn.textContent = 'Sending…'; }
    say('var(--muted)', 'Sending…');
    // FormSubmit can take most of a minute to answer (Brayden's first live test, 2026-10-22, sat on "Sending…"), so say so
    // after a few seconds, and give up after 75 so the button never hangs.
    var slow = setTimeout(function () { say('var(--muted)', 'Still sending. This can take up to a minute.'); }, 12000);
    var ctl = window.AbortController ? new AbortController() : null, cap = ctl && setTimeout(function () { ctl.abort(); }, 75000);
    fetch('https://formsubmit.co/ajax/' + TO, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { clearTimeout(slow); clearTimeout(cap); return r.json(); })
      .then(function (d) {
        if (String(d.success) !== 'true') throw new Error(d.message || 'not sent');
        form.reset();
        [].forEach.call(form.querySelectorAll('select'), function (s) { s.dispatchEvent(new Event('change')); });
        say('var(--ok)', 'Thanks, ' + name + '. We got it and will be in touch soon.');
      })
      .catch(function () { clearTimeout(slow); clearTimeout(cap); say('var(--deny)', 'That didn’t send. Please try again, or email us at ' + TO + '.'); })
      .then(function () { if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute('data-label'); } });
  };
})();
// FM-END
// LS-START: partner logo strip you can scroll yourself
(function () {
  // Brayden, 2026-10-23: "make it go a bit faster and make it to where you can scroll through them if you want to". The
  // partner strip becomes a real horizontal scroller that this script moves along (a set every 40s, 30s on phones, about a
  // third faster than before), so people can also swipe it, drag it with the mouse, or scroll it sideways on a trackpad.
  // It waits while the mouse is over it or someone is moving it, then carries on. A third copy of the logos sits in front, so
  // it loops both ways without a visible jump. With reduced motion none of this runs and the logos sit in rows.
  if (!window.requestAnimationFrame || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  [].forEach.call(document.querySelectorAll('.lg-marquee'), function (box) {
    var track = box.querySelector('.lg-track'), sets = track && track.querySelectorAll('.lg-set');
    if (!sets || sets.length < 2) return;
    var first = sets[0], lead = sets[1].cloneNode(true);
    track.insertBefore(lead, first);                       // copy, logos, copy: room to move both ways
    box.classList.add('lg-js');
    [].forEach.call(track.querySelectorAll('img'), function (im) { im.setAttribute('draggable', 'false'); });
    var W = 0, pos = 0, placed = false, hover = false, drag = null, touching = false, lastUser = -1e9, seen = true, last = 0;
    function measure() {
      var w = first.offsetLeft - lead.offsetLeft;
      if (w > 0 && w !== W) { var k = W ? (pos - W) / W : 0; W = w; pos = W + k * W; placed = true; set(); }
    }
    function wrap() {                                      // the strip repeats every W, so jumping a whole W looks the same
      var d = 0;
      if (pos >= 2 * W) d = -W; else if (pos < W / 2) d = W;
      pos += d; if (drag) drag.from += d;
    }
    function set() { box.scrollLeft = pos; }
    function busy(now) { return hover || drag || touching || now - lastUser < 2500; }
    box.addEventListener('scroll', function () {           // a swipe, a trackpad or the keyboard moved it
      if (!placed || Math.abs(box.scrollLeft - pos) < 2) return;
      pos = box.scrollLeft; lastUser = performance.now();
      var before = pos; wrap(); if (pos !== before) set();
    }, { passive: true });
    // only a real mouse pauses it on hover: a tap on a phone can leave a hover behind that never ends
    box.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    box.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hover = false; });
    box.addEventListener('touchstart', function () { touching = true; }, { passive: true });
    box.addEventListener('touchend', function () { touching = false; lastUser = performance.now(); }, { passive: true });
    box.addEventListener('touchcancel', function () { touching = false; lastUser = performance.now(); }, { passive: true });
    box.addEventListener('pointerdown', function (e) {    // mouse: grab and drag (touch scrolls natively)
      if (e.pointerType !== 'mouse' || e.button !== 0 || !placed) return;
      drag = { x: e.clientX, from: pos }; box.classList.add('lg-grab'); e.preventDefault();
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      pos = drag.from - (e.clientX - drag.x); wrap(); set();
    });
    function end() { drag = null; box.classList.remove('lg-grab'); lastUser = performance.now(); }
    window.addEventListener('pointerup', function () { if (drag) end(); });
    window.addEventListener('blur', function () { if (drag) end(); });
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { seen = es[es.length - 1].isIntersecting; }).observe(box);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(track); else window.addEventListener('resize', measure);
    function tick(now) {
      var dt = last ? Math.min(now - last, 100) : 0; last = now;
      if (!W) measure();
      if (W && seen && !busy(now)) {
        pos += W / (innerWidth < 640 ? 30 : 40) * dt / 1000;
        wrap(); set();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
})();
// LS-END
// SR-START: site search
/* Site search (Brayden, 2026-10-20): the magnifier in the top bar opens a search box; results show as you type and
   take you to the spot, opening the FAQ answer, Key Features slide or Owners tile it points at.
   The index is built from the pages by build_pages.py (sr/build_index.py). */
(function () {
  var INDEX = [{"p": "home", "l": "Home", "t": "Home", "x": "MyGymFitness handles sign-ups, billing, and 24/7 door access, so gym owners can spend their time growing their gym.", "id": "", "k": "page"}, {"p": "home", "l": "Home", "t": "Your prices", "x": "You set plans, prices, and policies.", "id": "sr-home-1", "k": "tile"}, {"p": "home", "l": "Home", "t": "Your brand", "x": "Members see your name and logo.", "id": "sr-home-2", "k": "tile"}, {"p": "home", "l": "Home", "t": "We install it", "x": "We set up the controller on your door.", "id": "sr-home-3", "k": "tile"}, {"p": "home", "l": "Home", "t": "Keyless entry", "x": "Members get in with the app or a QR code.", "id": "sr-home-4", "k": "tile"}, {"p": "home", "l": "Home", "t": "We handle the day-to-day. You grow your gym.", "x": "Sign-ups, payments, and 24/7 door access that run on their own.", "id": "sr-home-5", "k": "section"}, {"p": "home", "l": "Home", "t": "Your gym, your way.", "x": "", "id": "sr-home-6", "k": "section"}, {"p": "home", "l": "Home", "t": "One tap. The door opens.", "x": "Members unlock the gym right from the app. Most gyms can't do that. Download here Download on the App Store Get it on Google Play", "id": "sr-home-7", "k": "section"}, {"p": "home", "l": "Home", "t": "Setup is on us.", "x": "01 Call We go over plans and door setup. 02 Set up Dashboard ready in about 2 minutes. 03 Install We install your door controller. 04 Invite Members join from your link.", "id": "sr-home-8", "k": "section"}, {"p": "home", "l": "Home", "t": "Exercise your faith.", "x": "Verse of the week I can do all things through Christ which strengtheneth me. Philippians 4:13 \u00b7 KJV But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint. Isaiah 40:31 \u00b7 KJV For ye are bought with a price: therefore glorify God in your body, and in your spirit, which are God's. 1 Corinthians 6:20 \u00b7 KJ", "id": "sr-home-9", "k": "section"}, {"p": "features", "l": "Features", "t": "Features", "x": "24/7 sign-ups and access, the member fitness app, classes and PT, and the gym shop, plus the member app's key features and where to download it.", "id": "", "k": "page"}, {"p": "features", "l": "Features", "t": "24/7 sign-ups & access", "x": "Members join, pay, and get in at any hour.", "id": "sr-features-1", "k": "card"}, {"p": "features", "l": "Features", "t": "Member fitness app", "x": "Track workouts, nutrition, and goals. Unlock the gym door.", "id": "sr-features-2", "k": "card"}, {"p": "features", "l": "Features", "t": "Classes & PT", "x": "Members book classes and trainers in the app.", "id": "sr-features-3", "k": "card"}, {"p": "features", "l": "Features", "t": "Gym shop", "x": "Sell merch, apparel, and more in the app.", "id": "sr-features-4", "k": "card"}, {"p": "features", "l": "Features", "t": "Muscle map", "x": "Tap a muscle to find its exercises.", "id": "sr-features-5", "k": "feature"}, {"p": "features", "l": "Features", "t": "Class calendar", "x": "Classes, workouts, nutrition, and PT, day by day.", "id": "sr-features-6", "k": "feature"}, {"p": "features", "l": "Features", "t": "Workout tracker", "x": "Build routines, then log each workout.", "id": "sr-features-7", "k": "feature"}, {"p": "features", "l": "Features", "t": "Calorie tracker", "x": "Log meals against a daily target.", "id": "sr-features-8", "k": "feature"}, {"p": "features", "l": "Features", "t": "Faith", "x": "A weekly verse and devotional.", "id": "sr-features-9", "k": "feature"}, {"p": "features", "l": "Features", "t": "Flex Points", "x": "A daily streak. Each day earns 5 more.", "id": "sr-features-10", "k": "feature"}, {"p": "features", "l": "Features", "t": "Progress", "x": "Weight goal, lift maxes, and progress photos.", "id": "sr-features-11", "k": "feature"}, {"p": "features", "l": "Features", "t": "Guided setup", "x": "Three questions build your week.", "id": "sr-features-12", "k": "feature"}, {"p": "features", "l": "Features", "t": "Waitlists", "x": "Get a ping when a spot opens.", "id": "sr-features-13", "k": "feature"}, {"p": "features", "l": "Features", "t": "Session packs", "x": "Buy class and PT packs. See what's left.", "id": "sr-features-14", "k": "feature"}, {"p": "features", "l": "Features", "t": "Train, book, and unlock. All in one app.", "x": "", "id": "hx-app", "k": "section"}, {"p": "features", "l": "Features", "t": "Download now", "x": "Search MyGymFitness on the App Store or Google Play. Download on the App Store Get it on Google Play", "id": "get-the-app", "k": "section"}, {"p": "owners", "l": "Owners", "t": "Owners", "x": "Your gym in your pocket: money in, revenue, growth, sales alerts and your membership breakdown, all in the MyGymFitness app.", "id": "", "k": "page"}, {"p": "owners", "l": "Owners", "t": "Join online", "x": "Members pick a plan, sign your waiver, and pay.", "id": "sr-owners-1", "k": "step"}, {"p": "owners", "l": "Owners", "t": "Walk in", "x": "Tap Unlock Gym or use the door code.", "id": "sr-owners-2", "k": "step"}, {"p": "owners", "l": "Owners", "t": "Door follows billing", "x": "Canceled, expired, or on hold? Access stops by itself.", "id": "sr-owners-3", "k": "step"}, {"p": "owners", "l": "Owners", "t": "Classes and bookings", "x": "Schedule classes. Mark attendance. Set classes, PT slots, and events once or on repeat, with a cap on spots. Book members in and track who shows up.", "id": "sr-owners-4", "k": "tool"}, {"p": "owners", "l": "Owners", "t": "Trainers and PT", "x": "PT packs, programs, and goals. Sell PT plans and packs. Trainers write programs and set goals for their own clients.", "id": "sr-owners-5", "k": "tool"}, {"p": "owners", "l": "Owners", "t": "Gym shop and apparel", "x": "Members buy merch in the app. Members buy merch in the app and pick it up at the desk. You get a sales alert on your phone when they do.", "id": "sr-owners-6", "k": "tool"}, {"p": "owners", "l": "Owners", "t": "Prospects", "x": "See who stopped at payment. See everyone who started signing up but stopped at payment, and send them an announcement by email or in the app.", "id": "sr-owners-7", "k": "tool"}, {"p": "owners", "l": "Owners", "t": "Payments due", "x": "Overdue payments and failed cards. Overdue and upcoming payments on one page. Collect a balance from the card on file without a second charge.", "id": "sr-owners-8", "k": "tool"}, {"p": "owners", "l": "Owners", "t": "Door and members", "x": "Unlock the door. Check entries. Unlock the door from anywhere. See who came in, when and how, plus any refused tries.", "id": "sr-owners-9", "k": "tool"}, {"p": "owners", "l": "Owners", "t": "Your gym in your pocket", "x": "", "id": "pocket", "k": "section"}, {"p": "owners", "l": "Owners", "t": "Share your sign-up link. Members do the rest.", "x": "", "id": "how", "k": "section"}, {"p": "owners", "l": "Owners", "t": "Money in", "x": "Demo gym: Summit Fitness Any period. Ready to print. $48,912.44 Transferred to you Every month, split by what sold. Members per month, past year. 418 members Up 167 since Nov 2025 418 On your phone, as it happens. Renewing memberships by plan.", "id": "demo-gym", "k": "section"}, {"p": "partners", "l": "Partners", "t": "Partners", "x": "What independent gym owners say about running their gym on MyGymFitness.", "id": "", "k": "page"}, {"p": "partners", "l": "Partners", "t": "Dalton Appelman, Owner, DA\u2019s Fitness", "x": "\u201cWith MyGymFitness, I get to spend way more time with my family and away from the gym which is awesome. I don\u2019t have to worry about scheduling a time to meet numerous people and get them signed up as members since all I have to do now is send them a link.\u201d", "id": "sr-partners-1", "k": "quote"}, {"p": "partners", "l": "Partners", "t": "Matthew Shaffer, Owner, My Fitness", "x": "\u201cMyGymFitness has allowed me to focus on my Personal Training appointments and getting things done around the gym. No longer dealing with paper contracts, key fobs, or taking the time to run reports has been a huge relief.\u201d", "id": "sr-partners-2", "k": "quote"}, {"p": "partners", "l": "Partners", "t": "Kevin Grantlin, Owner, TAC Fitness", "x": "\u201cMyGymFitness has made a huge impact on my gym especially when it comes to not having to use paperwork. My members have enjoyed being able to use their phones to get into the gym as well as tracking their progress.\u201d", "id": "sr-partners-3", "k": "quote"}, {"p": "partners", "l": "Partners", "t": "Leave a review", "x": "4.9 out of 5 on the App Store, from members using the app Already use MyGymFitness? Leave a review", "id": "app-store-review", "k": "review"}, {"p": "partners", "l": "Partners", "t": "Less paperwork. More of your day back.", "x": "", "id": "partners-top", "k": "section"}, {"p": "partners", "l": "Partners", "t": "Gyms that run on MyGymFitness", "x": "All Fit Barbenders BCB Clearwater Beach Fitness DA Fitness Center FitPhil Iron Revival Gym Iron Ridge Gym Ironheadz Gym My Fitness NLF2 TAC Fitness Unchained Fitness", "id": "sr-partners-4", "k": "section"}, {"p": "faq", "l": "FAQ", "t": "FAQ", "x": "Answers to common questions about MyGymFitness, for gym owners and members.", "id": "", "k": "page"}, {"p": "faq", "l": "FAQ \u00b7 Getting started", "t": "How do I get my gym set up?", "x": "New gyms are set up by invite. Once you're in, add your details and your gym's, and your dashboard is ready for plans in about two minutes.", "id": "sr-faq-1", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Getting started", "t": "Who sets prices and policies?", "x": "You do. We make the software. Your gym provides the gym, sets prices, contracts and cancellation policy, and holds the membership agreement.", "id": "sr-faq-2", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Getting started", "t": "What kinds of plans can I sell?", "x": "Memberships, day and week passes, class packs, and PT plans. Add contract lengths, setup fees, staffed-hours-only access, or private rate links.", "id": "sr-faq-3", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Getting started", "t": "Will members see my gym's brand?", "x": "Yes. Your gym's name and logo sit at the top of the app, with a small \"Powered by MyGymFitness\" line under it.", "id": "sr-faq-4", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Getting started", "t": "Can I add staff and trainers?", "x": "Yes. Add staff, teachers, and trainers, and choose who can see revenue.", "id": "sr-faq-5", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Members", "t": "Is there an app for iPhone and Android?", "x": "Yes. It's on the App Store and Google Play, and the web app installs from the browser.", "id": "sr-faq-6", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Members", "t": "Can one plan cover a couple or a family?", "x": "Yes. A plan can cover a partner or children, and each person gets their own login and door access.", "id": "sr-faq-7", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Members", "t": "Can a membership be put on hold?", "x": "Yes. Freeze it with a reason and a return date; billing and door access pause until it resumes.", "id": "sr-faq-8", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Members", "t": "Can members belong to more than one gym?", "x": "Yes. One MyGymFitness account works at several gyms.", "id": "sr-faq-9", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Members", "t": "Do members sign a waiver?", "x": "Yes. They sign it on their phone when they join, and you can change the wording.", "id": "sr-faq-10", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Door", "t": "Do I need to install the door hardware myself?", "x": "No. We provision the controller and set it up with your lock.", "id": "sr-faq-11", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Door", "t": "What if the internet goes down at the gym?", "x": "Keypad and QR entry keep working, and members can still open their last door code in the app.", "id": "sr-faq-12", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Door", "t": "What about members who don't use the app?", "x": "They can get a permanent keypad code, and the front desk can check them in.", "id": "sr-faq-13", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Money", "t": "How much does it cost?", "x": "It depends on how your gym wants to handle the platform fee. Book a trial and we'll walk you through the options.", "id": "sr-faq-14", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Money", "t": "What happens if a member's card fails?", "x": "They keep access through a grace period while the app shows what's owed. If it stays unpaid, access closes by itself.", "id": "sr-faq-15", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Money", "t": "Can members update their card or plan themselves?", "x": "Yes. They can change plans, renew, pay a balance, update their card, see receipts, and cancel where your gym allows it.", "id": "sr-faq-16", "k": "faq"}, {"p": "faq", "l": "FAQ \u00b7 Money", "t": "Can the front desk take payments?", "x": "Yes. Staff can charge the card on file, or record cash, checks, and comps.", "id": "sr-faq-17", "k": "faq"}, {"p": "faq", "l": "FAQ", "t": "Common questions", "x": "Getting started Members Door Money", "id": "faq", "k": "section"}, {"p": "contact", "l": "Contact", "t": "Contact", "x": "Contact MyGymFitness. Send us a message and we will get back to you.", "id": "", "k": "page"}, {"p": "contact", "l": "Contact", "t": "Get help", "x": "Questions, or trouble getting into your account? Send us a message.", "id": "cf-help", "k": "panel"}, {"p": "contact", "l": "Contact", "t": "Refer a gym, get $500", "x": "Know a gym owner who should be on MyGymFitness? Tell us who they are and we'll reach out.", "id": "refer", "k": "panel"}, {"p": "contact", "l": "Contact", "t": "Talk to us", "x": "", "id": "sr-contact-1", "k": "section"}, {"p": "book-a-trial", "l": "Book a trial", "t": "Book a trial", "x": "Book a trial of MyGymFitness for your gym. New gyms are set up by invite.", "id": "", "k": "page"}, {"p": "book-a-trial", "l": "Book a trial", "t": "Ready to put your gym in your pocket?", "x": "New gyms are set up by invite. Tell us about your gym to book your trial.", "id": "sr-book-a-trial-1", "k": "section"}];
  var nav = document.querySelector('header.nav');
  var btn = nav && nav.querySelector('.nav-search');
  if (!btn || !INDEX.length) return;
  nav.classList.add('js-search');
  // keep Tab order matching the screen: on computers the magnifier sits before Log in, below 1024px after Book a trial
  var cta = nav.querySelector('.nav-cta'), narrow = window.matchMedia && window.matchMedia('(max-width: 1023px)');
  if (cta && narrow) {
    var place = function () { if (narrow.matches) cta.parentNode.insertBefore(btn, cta.nextSibling); else cta.parentNode.insertBefore(btn, cta); };
    place();
    narrow.addEventListener ? narrow.addEventListener('change', place) : narrow.addListener(place);
  }
  var bundle = !!document.querySelector('[data-page]');
  var FILES = { 'home': 'index.html', 'features': 'features.html', 'how-it-works': 'features.html', 'owners': 'owners.html', 'partners': 'partners.html', 'faq': 'faq.html', 'contact': 'contact.html', 'book-a-trial': 'book-a-trial.html' };
  var SYN = {
    price: ['prices', 'pricing', 'cost', 'costs', 'fee', 'fees', 'rate', 'rates'],
    pay: ['payment', 'payments', 'billing', 'bill', 'charge', 'card', 'paid', 'money'],
    door: ['access', 'entry', 'unlock', 'keyless', 'key', 'keys', 'code', 'lock'],
    'class': ['classes', 'schedule', 'calendar'],
    app: ['iphone', 'android', 'phone', 'mobile'],
    refer: ['referral', 'refer a gym', '500'],
    trainer: ['pt', 'trainers', 'coach', 'staff', 'personal training'],
    cancel: ['canceled', 'cancellation', 'cancel policy'],
    join: ['sign-up', 'signup', 'sign up', 'sign-ups', 'register', 'member', 'members'],
    help: ['contact', 'support', 'locked out', 'login', 'log in'],
    workout: ['workouts', 'exercise', 'tracker', 'fitness', 'muscle'],
    shop: ['merch', 'apparel', 'store', 'sell'],
    install: ['hardware', 'controller', 'setup', 'set up'],
    review: ['reviews', 'rating', 'app store', 'stars']
  };
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u2019']/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var rows = INDEX.map(function (e, i) { return { e: e, i: i, t: ' ' + norm(e.t) + ' ', x: ' ' + norm(e.x) + ' ', l: ' ' + norm(e.l) + ' ' }; });
  function alts(tok) {
    var out = [];
    Object.keys(SYN).forEach(function (k) {
      var all = [k].concat(SYN[k]).map(norm);
      if (all.some(function (a) { return a === tok || (tok.length > 2 && a.indexOf(tok) === 0) || (a.length > 3 && tok.indexOf(a) === 0); })) all.forEach(function (a) { if (a !== tok && out.indexOf(a) < 0) out.push(a); });
    });
    return out;
  }
  function hit(hay, w) {
    if (hay.indexOf(' ' + w + ' ') >= 0) return 3;
    if (hay.indexOf(' ' + w) >= 0) return 2;
    return w.length > 2 && hay.indexOf(w) >= 0 ? 1 : 0;
  }
  function score(r, toks) {
    var s = 0;
    for (var k = 0; k < toks.length; k++) {
      var w = toks[k], best = hit(r.t, w) * 4 + hit(r.x, w) + hit(r.l, w) * 2;
      if (!best) {
        var a = alts(w);
        for (var j = 0; j < a.length && !best; j++) best = (hit(r.t, a[j]) * 4 + hit(r.x, a[j]) + hit(r.l, a[j])) * 0.5;
      }
      if (!best) return 0;
      s += best;
    }
    if (r.e.k === 'faq') s += 0.5;
    if (r.e.k === 'page') s += 0.3;
    return s;
  }
  // old tab names still find the renamed page (How it works became Features on 2026-10-21)
  var RENAMED = { 'how it works': 'features', 'get the app': 'download now' };
  function renamed(q) {
    var n = norm(q);
    Object.keys(RENAMED).forEach(function (k) { n = n.length > 5 && k.indexOf(n) === 0 ? RENAMED[k] : n.split(k).join(RENAMED[k]); });
    return n;
  }
  function search(q) {
    var toks = renamed(q).split(' ').filter(Boolean);
    if (!toks.length) return [];
    return rows.map(function (r) { return { r: r, s: score(r, toks) }; }).filter(function (o) { return o.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.r.i - b.r.i; }).slice(0, 12).map(function (o) { return o.r.e; });
  }
  function marks(text, q) {
    var toks = norm(q).split(' ').filter(function (w) { return w.length > 1 || /\d/.test(w); });
    if (!toks.length) return esc(text);
    var re = new RegExp('(' + toks.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'gi');
    return esc(text).replace(re, '<mark>$1</mark>');
  }
  function snippet(e, q) {
    var x = e.x || '', toks = norm(q).split(' ').filter(Boolean), lx = x.toLowerCase(), at = -1;
    for (var k = 0; k < toks.length && at < 0; k++) at = lx.indexOf(toks[k]);
    if (x.length <= 130 || at < 60) return x.length > 130 ? x.slice(0, x.lastIndexOf(' ', 128)) + '\u2026' : x;
    var from = x.lastIndexOf(' ', at - 40) + 1, s = x.slice(from, from + 130);
    return '\u2026' + s.slice(0, s.lastIndexOf(' ')) + '\u2026';
  }
  function hrefFor(e) {
    var hash = '#' + (e.id && !document.querySelector('[data-page="' + e.id + '"]') ? e.id : e.p);
    if (bundle) return hash;
    return (FILES[e.p] || 'index.html') + (e.id ? '#' + e.id : '');
  }

  // overlay, built on first open
  var box, input, list, empty, live, active = -1, results = [];
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>';
  var TRY = ['Door access', 'Classes', 'Billing', 'Refer a gym', 'Cancel'];
  function build() {
    box = document.createElement('div');
    box.className = 'sr';
    box.id = 'site-search';
    box.hidden = true;
    box.innerHTML = '<div class="sr-panel" role="dialog" aria-modal="true" aria-label="Search the site">' +
      '<div class="sr-bar">' + ICON + '<input class="sr-input" type="search" placeholder="Search the site" autocomplete="off" spellcheck="false" enterkeyhint="go" role="combobox" aria-expanded="false" aria-controls="sr-list" aria-autocomplete="list" aria-label="Search the site">' +
      '<button class="sr-close" type="button" aria-label="Close search"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
      '<ul class="sr-list" id="sr-list" role="listbox" aria-label="Results"></ul>' +
      '<div class="sr-empty"></div><p class="sr-live" aria-live="polite"></p></div>';
    document.body.appendChild(box);
    input = box.querySelector('.sr-input'); list = box.querySelector('.sr-list'); empty = box.querySelector('.sr-empty'); live = box.querySelector('.sr-live');
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (results.length) setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length); }
      else if (e.key === 'Enter') { e.preventDefault(); var a = list.querySelectorAll('.sr-hit')[active < 0 ? 0 : active]; if (a) a.click(); }
    });
    box.querySelector('.sr-close').addEventListener('click', function () { close(true); });
    box.addEventListener('click', function (e) {
      if (e.target === box) { close(true); return; }
      var chip = e.target.closest && e.target.closest('.sr-try');
      if (chip) { input.value = chip.getAttribute('data-q'); render(); input.focus(); return; }
      var a = e.target.closest && e.target.closest('.sr-hit, .sr-contact');
      if (a) {
        var id = a.getAttribute('data-target');
        close(false);
        if (!bundle && a.getAttribute('href').charAt(0) !== '#') {
          if (!id || a.pathname !== location.pathname || a.hash !== location.hash) return;   // the browser follows the link; a new #hash reveals via hashchange
          e.preventDefault();   // same page and same #hash fire no hashchange, so reveal here
        }
        setTimeout(function () { reveal(id); }, 60);
      }
    });
    var lastXY = '';
    box.addEventListener('mousemove', function (e) {
      var xy = e.clientX + ',' + e.clientY;   // only a real pointer move picks a result, not the list scrolling under a still mouse
      if (xy === lastXY) return;
      lastXY = xy;
      var a = e.target.closest && e.target.closest('.sr-hit');
      if (a && +a.getAttribute('data-i') !== active) setActive(+a.getAttribute('data-i'), true);
    });
    // hover look for the X and the Try chips by class too (the preview viewer misses :hover)
    box.addEventListener('mouseover', function (e) { var h = e.target.closest && e.target.closest('.sr-close, .sr-try'); if (h) h.classList.add('is-hot'); });
    box.addEventListener('mouseout', function (e) { var h = e.target.closest && e.target.closest('.sr-close, .sr-try'); if (h && !h.contains(e.relatedTarget)) h.classList.remove('is-hot'); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(true); }
      if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('sr-contact')) { e.preventDefault(); e.target.click(); return; }
      if (e.key === 'Tab') {      // keep focus inside the search box
        var f = [].slice.call(box.querySelectorAll('input, button, a.sr-contact, button.sr-try'));
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
  }
  function link(e, cls, inner, i) {
    var h = hrefFor(e);
    var attrs = ' class="' + cls + '" data-target="' + esc(e.id || '') + '"' + (bundle ? ' data-go="' + h + '"' : ' href="' + h + '"') +
      (i != null ? ' role="option" tabindex="-1"' : bundle ? ' role="link" tabindex="0"' : '');
    if (i != null) attrs += ' id="sr-opt-' + i + '" data-i="' + i + '" aria-selected="false"';
    return '<a' + attrs + '>' + inner + '</a>';
  }
  function setActive(i, fromMouse) {
    var hits = list.querySelectorAll('.sr-hit');
    for (var k = 0; k < hits.length; k++) { hits[k].classList.toggle('is-on', k === i); hits[k].setAttribute('aria-selected', k === i ? 'true' : 'false'); }
    active = i;
    if (i >= 0 && hits[i]) { input.setAttribute('aria-activedescendant', hits[i].id); if (!fromMouse) hits[i].scrollIntoView({ block: 'nearest' }); }
    else input.removeAttribute('aria-activedescendant');
  }
  function render() {
    var q = input.value.trim(), mq = q ? renamed(q) : '';   // an old name ("how it works") highlights the new one ("features")
    results = q ? search(q) : [];
    active = -1; input.removeAttribute('aria-activedescendant');
    list.innerHTML = results.map(function (e, i) {
      return '<li role="presentation">' + link(e, 'sr-hit', '<span class="sr-where">' + esc(e.l) + '</span><b class="sr-title">' + marks(e.t, mq) + '</b>' +
        (e.x && e.k !== 'page' || e.k === 'page' ? '<span class="sr-snip">' + marks(snippet(e, mq), mq) + '</span>' : ''), i) + '</li>';
    }).join('');
    input.setAttribute('aria-expanded', results.length ? 'true' : 'false');
    if (!q) {
      empty.innerHTML = '<p class="sr-hint">Try</p><div class="sr-tries">' + TRY.map(function (t) { return '<button type="button" class="sr-try" data-q="' + t + '">' + t + '</button>'; }).join('') + '</div>';
      live.textContent = '';
    } else if (!results.length) {
      empty.innerHTML = '<p class="sr-none">No results for \u201c' + esc(q) + '\u201d.</p><p class="sr-hint">Try \u201cdoor\u201d, \u201cclasses\u201d, or \u201cbilling\u201d. Or ' +
        link({ p: 'contact', id: '' }, 'sr-contact', 'ask us on the Contact page') + '.</p>';
      live.textContent = 'No results';
    } else {
      empty.innerHTML = '';
      live.textContent = results.length + (results.length === 1 ? ' result' : ' results');
      if (results.length) setActive(0, true);
    }
  }
  var lastFocus = null;
  function open() {
    if (!box) build();
    lastFocus = document.activeElement;
    box.hidden = false;
    document.documentElement.classList.add('sr-open');
    btn.setAttribute('aria-expanded', 'true');
    if (nav.classList.contains('menu-open')) { var mb = nav.querySelector('.nav-menu'); if (mb) mb.click(); }
    render();
    input.focus();
    input.select();
  }
  function close(restore) {
    if (!box || box.hidden) return;
    box.hidden = true;
    document.documentElement.classList.remove('sr-open');
    btn.setAttribute('aria-expanded', 'false');
    if (restore) { var t = lastFocus; if (!t || t === document.body || !t.isConnected || !t.getClientRects().length || box.contains(t)) t = btn; t.focus({ preventScroll: true }); }
  }
  btn.addEventListener('click', function () { if (box && !box.hidden) close(true); else open(); });
  var tapAt = 0;   // a tap also sends mouseenter; skip it so the button doesn't stay lit after the search closes
  btn.addEventListener('touchstart', function () { tapAt = Date.now(); }, { passive: true });
  btn.addEventListener('mouseenter', function () { if (Date.now() - tapAt > 1000) btn.classList.add('is-hot'); });
  btn.addEventListener('mouseleave', function () { btn.classList.remove('is-hot'); });
  document.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if (!typing && (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'))) { e.preventDefault(); open(); }
  });

  // Open what a search result (or a #link) points at: an FAQ answer, a Key Features slide or an Owners tile
  function reveal(id) {
    var el = id && document.getElementById(id);
    if (!el) return;
    if (el.getAttribute('role') === 'tabpanel' && el.hidden) { var tb = document.querySelector('[role="tab"][aria-controls="' + id + '"]'); if (tb) tb.click(); }
    if (el.tagName === 'DETAILS') el.open = true;
    else { var d = el.closest('details'); if (d) d.open = true; }
    if (el.classList.contains('ks-slide')) {
      var root = el.closest('[data-ks]'), slides = root ? [].slice.call(root.querySelectorAll('.ks-slide')) : [], n = slides.indexOf(el);
      var pos = root ? root.querySelectorAll('.ks-pos') : [];
      if (n >= 0 && pos[n]) pos[n].click();
      var host = root || el;
      host.scrollIntoView({ block: 'start' });
    } else if (el.classList.contains('mng-feat') && !el.classList.contains('is-open')) {
      var b = el.querySelector('.mng-feat-btn'); if (b) b.click();
      el.scrollIntoView({ block: 'center' });
    } else {
      el.scrollIntoView({ block: el.tagName === 'DETAILS' || el.classList.contains('quote') ? 'center' : 'start' });
    }
    el.classList.add('sr-flash');
    setTimeout(function () { el.classList.remove('sr-flash'); }, 1800);
  }
  function fromHash() {
    var h = location.hash.slice(1), t = h && document.getElementById(h);
    if (/^sr-/.test(h) || (t && t.getAttribute('role') === 'tabpanel' && t.hidden)) setTimeout(function () { reveal(h); }, 80);
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
// SR-END
// HF-START: Owners tiles follow the mouse while scrolling
/* Owners tiles: in the preview viewer the browser doesn't re-check what is under a still mouse while the page scrolls, so
   the lit tile could lag behind. On scroll, light whichever tile is under the last mouse position. */
(function () {
  var list = document.querySelector('.mng-feats');
  if (!list || !document.elementFromPoint) return;
  var x = -1, y = -1, ticking = false;
  document.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { x = y = -1; });
  window.addEventListener('scroll', function () {
    if (x < 0 || ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var el = document.elementFromPoint(x, y), t = el && el.closest ? el.closest('.mng-feat') : null;
      if (t && !list.contains(t)) t = null;
      [].forEach.call(list.querySelectorAll('.mng-feat'), function (f) { f.classList.toggle('is-hot', f === t); });
    });
  }, { passive: true });
})();
// HF-END

// Preview only: when one document carries every page (data-page), the menu's #links switch pages.
(function () {
  var pages = document.querySelectorAll('[data-page]');
  if (!pages.length) return;
  function pageFor(hash) {
    var key = (hash || '').replace(/^#/, '') || 'home';
    if (key === 'manage') key = 'owners';   // the Manage tab was renamed Owners
    if (key === 'how-it-works') key = 'features';   // How it works was renamed Features
    for (var i = 0; i < pages.length; i++) if (pages[i].getAttribute('data-page') === key) return { page: pages[i], target: null };
    var el = key && document.getElementById(key);
    var host = el && el.closest('[data-page]');
    return host ? { page: host, target: el } : { page: pages[0], target: null };
  }
  function toTop(el) {
    var root = document.documentElement, was = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    if (el) el.scrollIntoView({ block: 'start' });
    else { window.scrollTo(0, 0); document.body.scrollIntoView({ block: 'start' }); }
    root.style.scrollBehavior = was;
  }
  function show(hash, moveFocus) {
    var hit = pageFor(hash), key = hit.page.getAttribute('data-page');
    for (var i = 0; i < pages.length; i++) pages[i].hidden = pages[i] !== hit.page;
    document.title = hit.page.getAttribute('data-title') || document.title;
    var links = document.querySelectorAll('header.nav .nav-links a');
    for (var j = 0; j < links.length; j++) {
      if ((links[j].getAttribute('data-go') || links[j].getAttribute('href')) === '#' + key) links[j].setAttribute('aria-current', 'page');
      else links[j].removeAttribute('aria-current');
    }
    toTop(hit.target);
    if (moveFocus && !hit.target) {
      var h = hit.page.querySelector('h1');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
  }
  // Brayden, 2026-10-20: "why cant i click on the tabs". The preview window opens links outside the page
  // (or ignores them) instead of following #links, so here the in-page links carry no href for it to catch:
  // each keeps its target in data-go and a click switches the page directly.
  var inPage = document.querySelectorAll('a[href^="#"]');
  for (var k = 0; k < inPage.length; k++) {
    var to = inPage[k].getAttribute('href');
    if (to.length < 2) continue;
    inPage[k].setAttribute('data-go', to);
    inPage[k].removeAttribute('href');
    inPage[k].setAttribute('role', 'link');
    inPage[k].setAttribute('tabindex', '0');
  }
  function go(hash) {
    try { if (location.hash !== hash) history.pushState(null, '', hash); } catch (err) {}
    show(hash, true);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-go]');
    if (!a) return;
    e.preventDefault();
    go(a.getAttribute('data-go'));
  });
  document.addEventListener('keydown', function (e) {
    var a = e.key === 'Enter' && e.target.closest && e.target.closest('[data-go]');
    if (a) { e.preventDefault(); go(a.getAttribute('data-go')); }
  });
  window.addEventListener('hashchange', function () { show(location.hash, true); });
  window.addEventListener('popstate', function () { show(location.hash, true); });
  show(location.hash, false);
})();
