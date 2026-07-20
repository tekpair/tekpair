(function () {
  'use strict';

  var STORAGE_KEY = 'tekpair_consent';

  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
  } catch (error) {
    // Continue showing the notice if localStorage is unavailable.
  }

  var css = `
    #tekpair-cookie-banner {
      position: fixed;
      left: 50%;
      bottom: 1.25rem;
      z-index: 600;
      width: min(1080px, calc(100% - 2rem));
      transform: translateX(-50%);
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr) auto;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.1rem;
      border: 1px solid rgba(255, 255, 255, 0.13);
      border-radius: 16px;
      background:
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.065),
          rgba(255, 255, 255, 0.018)
        ),
        rgba(23, 27, 34, 0.97);
      color: #a8b1c5;
      box-shadow:
        0 22px 60px rgba(0, 0, 0, 0.42),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      -webkit-backdrop-filter: blur(22px) saturate(125%);
      backdrop-filter: blur(22px) saturate(125%);
      font-family: "DM Sans", Arial, sans-serif;
    }

    #tekpair-cookie-banner::before {
      content: "";
      position: absolute;
      top: 0;
      left: 2rem;
      right: 2rem;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(114, 191, 202, 0.78),
        transparent
      );
    }

    .tekpair-cookie-icon {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(114, 191, 202, 0.18);
      border-radius: 12px;
      background: rgba(99, 183, 196, 0.07);
      color: #72bfca;
      flex-shrink: 0;
    }

    .tekpair-cookie-icon svg {
      width: 24px;
      height: 24px;
    }

    .tekpair-cookie-copy {
      min-width: 0;
    }

    .tekpair-cookie-title {
      display: block;
      margin-bottom: 0.18rem;
      color: #eef1f8;
      font-family: "Instrument Sans", "DM Sans", Arial, sans-serif;
      font-size: 0.9rem;
      font-weight: 750;
      line-height: 1.3;
    }

    .tekpair-cookie-text {
      display: block;
      color: #8f99ad;
      font-size: 0.78rem;
      line-height: 1.55;
    }

    #tekpair-cookie-banner a {
      color: #72bfca;
      text-decoration: none;
      font-weight: 650;
    }

    #tekpair-cookie-banner a:hover,
    #tekpair-cookie-banner a:focus-visible {
      text-decoration: underline;
    }

    #tekpair-cookie-accept {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.68rem 1.2rem;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 9px;
      background: linear-gradient(135deg, #579fac, #447f8c);
      color: #f6fbfc;
      box-shadow:
        0 8px 22px rgba(51, 111, 124, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.18);
      font-family: "DM Sans", Arial, sans-serif;
      font-size: 0.82rem;
      font-weight: 750;
      white-space: nowrap;
      cursor: pointer;
      transition:
        background 0.18s ease,
        transform 0.18s ease,
        box-shadow 0.18s ease;
    }

    #tekpair-cookie-accept:hover {
      background: linear-gradient(135deg, #61aab7, #4b8895);
      transform: translateY(-1px);
      box-shadow:
        0 10px 25px rgba(51, 111, 124, 0.23),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    #tekpair-cookie-accept:focus-visible {
      outline: 2px solid rgba(114, 191, 202, 0.55);
      outline-offset: 3px;
    }

    #tekpair-cookie-banner.is-leaving {
      opacity: 0;
      transform: translate(-50%, 14px);
      pointer-events: none;
    }

    @media (max-width: 720px) {
      #tekpair-cookie-banner {
        bottom: 0.75rem;
        grid-template-columns: 42px minmax(0, 1fr);
        gap: 0.8rem;
        padding: 0.95rem;
      }

      .tekpair-cookie-icon {
        width: 42px;
        height: 42px;
      }

      .tekpair-cookie-icon svg {
        width: 21px;
        height: 21px;
      }

      #tekpair-cookie-accept {
        grid-column: 1 / -1;
        width: 100%;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      #tekpair-cookie-banner {
        animation: tekpair-cookie-enter 0.35s ease both;
        transition:
          opacity 0.25s ease,
          transform 0.25s ease;
      }

      @keyframes tekpair-cookie-enter {
        from {
          opacity: 0;
          transform: translate(-50%, 16px);
        }

        to {
          opacity: 1;
          transform: translate(-50%, 0);
        }
      }
    }
  `;

  var style = document.createElement('style');
  style.id = 'tekpair-cookie-banner-styles';
  style.textContent = css;
  document.head.appendChild(style);

  var banner = document.createElement('aside');
  banner.id = 'tekpair-cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie and analytics notice');

  banner.innerHTML = `
    <div class="tekpair-cookie-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
        <path d="M8.5 8.5h.01M16 15.5h.01M12 12h.01M11 17h.01M7 14h.01"/>
      </svg>
    </div>

    <div class="tekpair-cookie-copy">
      <strong class="tekpair-cookie-title">
        Cookies &amp; analytics
      </strong>

      <span class="tekpair-cookie-text">
        We use cookies and analytics tools, including session recording
        through Microsoft Clarity, to understand how visitors use this site
        and improve the experience. Learn more in our
        <a href="/privacy/">Privacy Policy</a>.
      </span>
    </div>
  `;

  var button = document.createElement('button');
  button.id = 'tekpair-cookie-accept';
  button.type = 'button';
  button.textContent = 'Got it';

  button.addEventListener('click', function () {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (error) {
      // The notice can still be dismissed for the current page.
    }

    banner.classList.add('is-leaving');

    window.setTimeout(function () {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 280);
  });

  banner.appendChild(button);

  function mountBanner() {
    if (!document.getElementById('tekpair-cookie-banner')) {
      document.body.appendChild(banner);
    }
  }

  if (document.body) {
    mountBanner();
  } else {
    document.addEventListener('DOMContentLoaded', mountBanner, {
      once: true
    });
  }
}());
