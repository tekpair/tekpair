(function () {
  'use strict';

  function initializeMobileNavigation() {
    var navToggle = document.querySelector('.nav-toggle');
    var mobileMenu = document.querySelector('.mobile-menu');

    if (!navToggle || !mobileMenu) return;
    if (mobileMenu.dataset.tekpairMobileNavReady === 'true') return;

    mobileMenu.dataset.tekpairMobileNavReady = 'true';

    var mobileGroups = Array.from(
      mobileMenu.querySelectorAll('.mobile-nav-group')
    );

    var mobileLinks = Array.from(
      mobileMenu.querySelectorAll('a')
    );

    var navHeight = document.documentElement.style
      .getPropertyValue('--nav-height') || '67px';

    if (!mobileMenu.id) {
      mobileMenu.id = 'tekpair-mobile-menu';
    }

    navToggle.setAttribute('aria-controls', mobileMenu.id);
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');

    mobileMenu.setAttribute('aria-hidden', 'true');

    /*
     * Add mobile-navigation styling.
     */
    if (!document.getElementById('tekpair-mobile-nav-styles')) {
      var style = document.createElement('style');
      style.id = 'tekpair-mobile-nav-styles';

      style.textContent = `
        body.tekpair-mobile-nav-open {
          overflow: hidden;
        }

        #tekpair-mobile-nav-overlay {
          position: fixed;
          inset: 0;
          z-index: 189;
          background: rgba(4, 6, 10, 0.64);
          -webkit-backdrop-filter: blur(5px);
          backdrop-filter: blur(5px);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition:
            opacity 0.22s ease,
            visibility 0.22s ease;
        }

        #tekpair-mobile-nav-overlay.is-visible {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        @media (max-width: 900px) {
          .nav-toggle {
            position: relative;
            z-index: 205;
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 8px;
            border: 1px solid rgba(255, 255, 255, 0.11);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.035);
            color: #eef1f8;
            cursor: pointer;
            transition:
              border-color 0.18s ease,
              background 0.18s ease;
          }

          .nav-toggle:hover,
          .nav-toggle:focus-visible {
            border-color: rgba(114, 191, 202, 0.35);
            background: rgba(99, 183, 196, 0.07);
            outline: none;
          }

          .nav-toggle span {
            width: 22px;
            height: 2px;
            border-radius: 999px;
            background: currentColor;
            transform-origin: center;
            transition:
              transform 0.24s ease,
              opacity 0.18s ease;
          }

          .nav-toggle.open span:nth-child(1) {
            transform: translateY(7px) rotate(45deg);
          }

          .nav-toggle.open span:nth-child(2) {
            opacity: 0;
          }

          .nav-toggle.open span:nth-child(3) {
            transform: translateY(-7px) rotate(-45deg);
          }

          .mobile-menu {
            position: fixed;
            top: ${navHeight};
            left: 0;
            right: 0;
            z-index: 200;
            width: 100%;
            max-height: calc(100dvh - ${navHeight});
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            overscroll-behavior: contain;
            padding: 0.85rem 1.25rem 1.4rem;
            border-top: 1px solid rgba(255, 255, 255, 0.09);
            border-bottom: 1px solid rgba(255, 255, 255, 0.11);
            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.045),
                rgba(255, 255, 255, 0.012)
              ),
              rgba(17, 20, 27, 0.985);
            box-shadow:
              0 26px 60px rgba(0, 0, 0, 0.46),
              inset 0 1px 0 rgba(255, 255, 255, 0.04);
            -webkit-backdrop-filter: blur(24px) saturate(130%);
            backdrop-filter: blur(24px) saturate(130%);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transform: translateY(-12px);
            transition:
              opacity 0.22s ease,
              transform 0.22s ease,
              visibility 0.22s ease;
          }

          .mobile-menu.open {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateY(0);
          }

          .mobile-nav-group {
            border-bottom: 1px solid rgba(255, 255, 255, 0.075);
          }

          .mobile-nav-group:last-of-type {
            border-bottom: none;
          }

          .mobile-nav-trigger {
            width: 100%;
            min-height: 56px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 0.8rem 0.2rem;
            border: 0;
            background: transparent;
            color: #eef1f8;
            font-family: "DM Sans", Arial, sans-serif;
            font-size: 0.96rem;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
          }

          .mobile-nav-trigger svg {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
            color: #7f899c;
            transition:
              color 0.2s ease,
              transform 0.22s ease;
          }

          .mobile-nav-group.is-open .mobile-nav-trigger {
            color: #72bfca;
          }

          .mobile-nav-group.is-open .mobile-nav-trigger svg {
            color: #72bfca;
            transform: rotate(180deg);
          }

          .mobile-nav-panel {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows 0.24s ease;
          }

          .mobile-nav-group.is-open .mobile-nav-panel {
            grid-template-rows: 1fr;
          }

          .mobile-nav-panel-inner {
            min-height: 0;
            display: grid;
            gap: 0.25rem;
            overflow: hidden;
            padding: 0 0.1rem;
          }

          .mobile-nav-group.is-open .mobile-nav-panel-inner {
            padding-bottom: 0.85rem;
          }

          .mobile-menu .mobile-nav-panel a {
            display: grid;
            grid-template-columns: 38px minmax(0, 1fr);
            align-items: center;
            gap: 0.75rem;
            min-height: 50px;
            padding: 0.55rem 0.65rem;
            border: 1px solid transparent;
            border-radius: 10px;
            color: #a8b1c5;
            font-size: 0.87rem;
            font-weight: 600;
            line-height: 1.35;
            text-decoration: none;
            transition:
              color 0.18s ease,
              border-color 0.18s ease,
              background 0.18s ease;
          }

          .mobile-menu .mobile-nav-panel a:hover,
          .mobile-menu .mobile-nav-panel a:focus-visible,
          .mobile-menu .mobile-nav-panel a[aria-current="page"] {
            border-color: rgba(114, 191, 202, 0.17);
            background: rgba(99, 183, 196, 0.065);
            color: #eef1f8;
            outline: none;
          }

          .mobile-nav-icon {
            width: 38px;
            height: 38px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(114, 191, 202, 0.15);
            border-radius: 9px;
            background: rgba(99, 183, 196, 0.065);
            color: #72bfca;
          }

          .mobile-nav-icon svg {
            width: 18px;
            height: 18px;
          }

          .mobile-menu > .mobile-quote-link {
            width: 100%;
            min-height: 48px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-top: 1rem;
            padding: 0.78rem 1rem;
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 10px;
            background: linear-gradient(135deg, #579fac, #447f8c);
            color: #f6fbfc;
            box-shadow:
              0 9px 24px rgba(51, 111, 124, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.18);
            font-size: 0.92rem;
            font-weight: 750;
            text-align: center;
            text-decoration: none;
          }
        }

        @media (min-width: 901px) {
          .mobile-menu {
            display: none !important;
          }

          #tekpair-mobile-nav-overlay {
            display: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mobile-menu,
          .mobile-nav-panel,
          .nav-toggle span,
          #tekpair-mobile-nav-overlay {
            transition: none !important;
          }
        }
      `;

      document.head.appendChild(style);
    }

    /*
     * Background overlay.
     */
    var overlay = document.getElementById(
      'tekpair-mobile-nav-overlay'
    );

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tekpair-mobile-nav-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
    }

    function closeGroups(exception) {
      mobileGroups.forEach(function (group) {
        if (group === exception) return;

        group.classList.remove('is-open');

        var trigger = group.querySelector('.mobile-nav-trigger');

        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    function openMenu() {
      navToggle.classList.add('open');
      mobileMenu.classList.add('open');
      overlay.classList.add('is-visible');

      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close navigation');

      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('tekpair-mobile-nav-open');
    }

    function closeMenu(options) {
      options = options || {};

      navToggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      overlay.classList.remove('is-visible');

      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation');

      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('tekpair-mobile-nav-open');

      closeGroups();

      if (options.returnFocus) {
        navToggle.focus();
      }
    }

    function toggleMenu() {
      if (mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    /*
     * Main hamburger button.
     */
    navToggle.addEventListener('click', function (event) {
      event.preventDefault();
      toggleMenu();
    });

    /*
     * Accordion navigation groups.
     * Only one group remains open at a time.
     */
    mobileGroups.forEach(function (group, index) {
      var trigger = group.querySelector('.mobile-nav-trigger');
      var panel = group.querySelector('.mobile-nav-panel');

      if (!trigger || !panel) return;

      if (!panel.id) {
        panel.id = 'tekpair-mobile-nav-panel-' + (index + 1);
      }

      trigger.setAttribute('aria-controls', panel.id);
      trigger.setAttribute('aria-expanded', 'false');

      trigger.addEventListener('click', function () {
        var shouldOpen = !group.classList.contains('is-open');

        closeGroups(group);

        group.classList.toggle('is-open', shouldOpen);
        trigger.setAttribute(
          'aria-expanded',
          String(shouldOpen)
        );
      });
    });

    /*
     * Close after selecting a link.
     */
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    /*
     * Close from the background overlay.
     */
    overlay.addEventListener('click', function () {
      closeMenu();
    });

    /*
     * Escape-key support.
     */
    document.addEventListener('keydown', function (event) {
      if (
        event.key === 'Escape' &&
        mobileMenu.classList.contains('open')
      ) {
        closeMenu({
          returnFocus: true
        });
      }
    });

    /*
     * Reset mobile state after resizing to desktop.
     */
    window.addEventListener('resize', function () {
      if (
        window.innerWidth > 900 &&
        mobileMenu.classList.contains('open')
      ) {
        closeMenu();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initializeMobileNavigation,
      { once: true }
    );
  } else {
    initializeMobileNavigation();
  }
}());
