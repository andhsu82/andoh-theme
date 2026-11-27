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
    initHeader();
    initPageFade();
  }

  // One controller for the header, modelled on the In Common With interaction:
  // - over the cover photo the header is transparent with white text, and on the homepage the logo
  //   sits large at the middle left of the photo;
  // - scrolling (or moving the mouse to the top) glides the logo back into the header;
  // - moving the mouse to the top edge fades the header in on the paper colour with dark text;
  // - past the cover the header hides until the mouse comes back to the top.
  var header = null;
  var cover = null;
  var nearTop = false;
  var overHeader = false;
  var logoFrame = 0;

  function initHeader() {
    header = document.querySelector('.section-header');
    if (!header) return;
    cover = document.querySelector('.andoh-cover');
    root.classList.toggle('andoh-has-cover', !!cover);
    if (!header.dataset.andohBound) {
      header.dataset.andohBound = '1';
      document.addEventListener('mousemove', function (event) {
        var limit = nearTop ? header.offsetHeight + 24 : 72;
        var next = event.clientY < limit;
        if (next !== nearTop) {
          nearTop = next;
          updateHeader();
        }
      });
      document.documentElement.addEventListener('mouseleave', function () {
        nearTop = false;
        updateHeader();
      });
      header.addEventListener('mouseenter', function (event) {
        // The large cover logo belongs to the header, but pointing at it should not pull it away.
        if (event.clientY > header.offsetHeight) return;
        overHeader = true;
        updateHeader();
      });
      header.addEventListener('mouseleave', function () {
        overHeader = false;
        updateHeader();
      });
      header.addEventListener('focusin', updateHeader);
      header.addEventListener('focusout', function () {
        setTimeout(updateHeader, 0);
      });
      document.addEventListener('click', function () {
        setTimeout(updateHeader, 0);
      });
      window.addEventListener('scroll', updateHeader, { passive: true });
      window.addEventListener('resize', function () {
        placeHeroLogo();
        updateHeader();
      });
    }
    placeHeroLogo();
    updateHeader();
    // Let the first paint settle before the logo is allowed to animate.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add('andoh-header-ready');
      });
    });
  }

  function busy() {
    return header.contains(document.activeElement) || !!header.querySelector('details[open]');
  }

  function updateHeader() {
    if (!header) return;
    var y = window.scrollY;
    var design = !!(window.Shopify && Shopify.designMode);
    var hover = nearTop || overHeader || busy();
    var overCover = !!cover && cover.getBoundingClientRect().bottom > header.offsetHeight;
    var light = overCover && !hover;
    var hero = light && y < 10 && heroAllowed();

    root.classList.toggle('andoh-header-hover', hover);
    root.classList.toggle('andoh-header-light', light);
    root.classList.toggle('andoh-header-solid', !light && (hover || y > 40));
    root.classList.toggle('andoh-logo-hero', hero);
    if (root.classList.contains('andoh-header-reveal')) {
      root.classList.toggle('andoh-header-shown', y < 40 || overCover || hover || design);
    }
  }

  function heroAllowed() {
    return (
      root.classList.contains('andoh-logo-hero-on') &&
      window.matchMedia('(min-width: 990px)').matches &&
      cover.closest('#MainContent > .shopify-section:first-child') !== null
    );
  }

  // Work out how far the header logo has to move and grow to sit at the middle left of the cover.
  function placeHeroLogo() {
    if (!cover || !header) return;
    var logo = header.querySelector('.header__heading-logo-wrapper') || header.querySelector('.header__heading-link');
    if (!logo) return;
    cancelAnimationFrame(logoFrame);
    logoFrame = requestAnimationFrame(function () {
      var saved = logo.style.transform;
      logo.style.transition = 'none';
      logo.style.transform = 'none';
      var box = logo.getBoundingClientRect();
      var area = cover.getBoundingClientRect();
      logo.style.transform = saved;
      logo.offsetWidth;
      logo.style.transition = '';
      if (!box.width) return;
      var scale = 2;
      var targetLeft = area.left + area.width * 0.26;
      var targetMiddle = area.top + window.scrollY + area.height * 0.5;
      var naturalMiddle = box.top + box.height / 2;
      root.style.setProperty('--andoh-logo-dx', Math.round(targetLeft - box.left) + 'px');
      root.style.setProperty('--andoh-logo-dy', Math.round(targetMiddle - window.scrollY - naturalMiddle) + 'px');
      root.style.setProperty('--andoh-logo-scale', scale);
    });
  }

  // Clicking through to another page fades the current one out first, then the next one fades in.
  function initPageFade() {
    if (!root.classList.contains('andoh-page-fade')) return;
    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.Shopify && Shopify.designMode) return;
      var link = event.target.closest('a[href]');
      if (!link || link.hasAttribute('download')) return;
      if (link.target && link.target !== '_self') return;
      var url;
      try {
        url = new URL(link.href, location.href);
      } catch (e) {
        return;
      }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
      if (/\/cart\/(add|change|clear)/.test(url.pathname)) return;
      event.preventDefault();
      root.classList.add('andoh-leaving');
      setTimeout(function () {
        location.href = url.href;
      }, 260);
    });
    window.addEventListener('pageshow', function () {
      root.classList.remove('andoh-leaving');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', function () {
    initHeader();
    apply('mode', root.getAttribute('data-andoh-mode') || 'built');
    apply('city', root.getAttribute('data-andoh-city') || 'taipei');
  });
})();
