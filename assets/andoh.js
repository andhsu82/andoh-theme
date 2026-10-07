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

  // Header that shows at the top of the page, hides once you scroll, and slides back in
  // whenever the mouse moves near the top of the window.
  function initHeaderReveal() {
    if (!root.classList.contains('andoh-header-reveal')) return;
    var header = document.querySelector('.section-header');
    if (!header) return;
    var nearTop = false;
    var overHeader = false;

    function busy() {
      return header.contains(document.activeElement) || header.querySelector('details[open]');
    }
    function update() {
      var show = window.scrollY < 40 || nearTop || overHeader || busy() || (window.Shopify && Shopify.designMode);
      root.classList.toggle('andoh-header-shown', !!show);
    }

    document.addEventListener('mousemove', function (event) {
      var limit = nearTop ? header.offsetHeight + 24 : 72;
      nearTop = event.clientY < limit;
      update();
    });
    document.documentElement.addEventListener('mouseleave', function () {
      nearTop = false;
      update();
    });
    header.addEventListener('mouseenter', function () {
      overHeader = true;
      update();
    });
    header.addEventListener('mouseleave', function () {
      overHeader = false;
      update();
    });
    header.addEventListener('focusin', update);
    header.addEventListener('focusout', function () {
      setTimeout(update, 0);
    });
    document.addEventListener('click', function () {
      setTimeout(update, 0);
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
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
