/* andoh: FLAT / BUILT and TAIPEI / NEW YORK switches, plus the live city clock.
   The current choice is stored per visitor so it carries across pages. */
(function () {
  var root = document.documentElement;
  var STORE = { mode: 'andoh-mode', city: 'andoh-city' };
  var VALUES = { mode: ['built', 'flat'], city: ['taipei', 'ny'] };

  function save(key, value) {
    try {
      localStorage.setItem(STORE[key], value);
    } catch (e) {}
  }

  function apply(key, value) {
    if (VALUES[key].indexOf(value) === -1) return;
    root.setAttribute('data-andoh-' + key, value);
    document.querySelectorAll('[data-andoh-set="' + key + '"]').forEach(function (button) {
      button.setAttribute('aria-pressed', button.dataset.andohValue === value ? 'true' : 'false');
    });
    if (key === 'city') tick();
  }

  function tick() {
    var ny = root.getAttribute('data-andoh-city') === 'ny';
    var time = '';
    try {
      time = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: ny ? 'America/New_York' : 'Asia/Taipei',
      }).format(new Date());
    } catch (e) {}
    document.querySelectorAll('[data-andoh-clock]').forEach(function (el) {
      el.textContent = (ny ? 'Now in New York ' : 'Now in Taipei ') + time;
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-andoh-set]');
    if (!button) return;
    var key = button.dataset.andohSet;
    var value = button.dataset.andohValue;
    apply(key, value);
    save(key, value);
  });

  function init() {
    apply('mode', root.getAttribute('data-andoh-mode') || 'built');
    apply('city', root.getAttribute('data-andoh-city') || 'taipei');
    tick();
    setInterval(tick, 30000);
    initHeaderReveal();
  }

  // Header that slides in when the mouse reaches the top of the window
  function initHeaderReveal() {
    if (!root.classList.contains('andoh-header-reveal')) return;
    var header = document.querySelector('.section-header');
    var hint = document.querySelector('.andoh-header-hint');
    if (!header) return;
    function show() {
      root.classList.add('andoh-header-shown');
    }
    function hide() {
      if (header.contains(document.activeElement) || header.querySelector('details[open]')) return;
      root.classList.remove('andoh-header-shown');
    }
    if (hint) hint.addEventListener('mouseenter', show);
    header.addEventListener('mouseenter', show);
    header.addEventListener('mouseleave', hide);
    header.addEventListener('focusin', show);
    header.addEventListener('focusout', function () {
      setTimeout(hide, 0);
    });
    document.addEventListener('click', function (event) {
      if (!header.contains(event.target)) hide();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', function () {
    apply('mode', root.getAttribute('data-andoh-mode') || 'built');
    apply('city', root.getAttribute('data-andoh-city') || 'taipei');
  });
})();
