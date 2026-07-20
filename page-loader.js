(function () {
  const startTime = performance.now();
  const minimumDisplayTime = 450;
  const maximumDisplayTime = 5000;

  const root = document.documentElement;
  const body = document.body;

  if (!body || document.getElementById('page-loader')) return;

  root.classList.add('page-loader-active');
  body.classList.add('page-loader-active');

  const styles = document.createElement('style');

  styles.textContent = `
    html.page-loader-active,
    html.page-loader-active body {
      overflow: hidden !important;
    }

    body.page-loader-active > *:not(#page-loader) {
      visibility: hidden !important;
    }

    #page-loader {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: grid;
      place-items: center;
      background:
        radial-gradient(
          circle at center,
          rgba(99, 183, 196, .08),
          transparent 34%
        ),
        linear-gradient(
          180deg,
          #151920 0%,
          #0e1117 100%
        );
      opacity: 1;
      visibility: visible;
      transition:
        opacity .4s ease,
        visibility .4s ease;
    }

    #page-loader.is-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .page-loader__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-align: center;
    }

    .page-loader__spinner {
      position: relative;
      width: 76px;
      height: 76px;
      display: grid;
      place-items: center;
    }

    .page-loader__spinner::before,
    .page-loader__spinner::after {
      content: '';
      position: absolute;
      border-radius: 50%;
    }

    .page-loader__spinner::before {
      inset: 0;
      border: 2px solid rgba(255, 255, 255, .08);
      border-top-color: #72bfca;
      border-right-color: rgba(114, 191, 202, .42);
      box-shadow:
        0 0 22px rgba(99, 183, 196, .12),
        inset 0 0 16px rgba(99, 183, 196, .04);
      animation: page-loader-spin .85s linear infinite;
    }

    .page-loader__spinner::after {
      inset: 8px;
      border: 1px solid rgba(114, 191, 202, .16);
      border-bottom-color: #63b7c4;
      animation: page-loader-spin-reverse 1.3s linear infinite;
    }

    .page-loader__logo {
      position: relative;
      z-index: 2;
      width: 38px;
      height: 38px;
      object-fit: contain;
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, .28));
      animation: page-loader-pulse 1.4s ease-in-out infinite;
    }

    .page-loader__text {
      color: #a8b1c5;
      font-family: 'DM Sans', Arial, sans-serif;
      font-size: .72rem;
      font-weight: 700;
      letter-spacing: .16em;
      text-transform: uppercase;
    }

    .page-loader__dots::after {
      content: '';
      display: inline-block;
      width: 1.6em;
      text-align: left;
      animation: page-loader-dots 1.3s steps(4, end) infinite;
    }

    @keyframes page-loader-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes page-loader-spin-reverse {
      to {
        transform: rotate(-360deg);
      }
    }

    @keyframes page-loader-pulse {
      0%,
      100% {
        transform: scale(.94);
        opacity: .78;
      }

      50% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes page-loader-dots {
      0% {
        content: '';
      }

      25% {
        content: '.';
      }

      50% {
        content: '..';
      }

      75%,
      100% {
        content: '...';
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .page-loader__spinner::before,
      .page-loader__spinner::after,
      .page-loader__logo,
      .page-loader__dots::after {
        animation: none !important;
      }

      #page-loader {
        transition-duration: .01ms;
      }
    }
  `;

  document.head.appendChild(styles);

  const loader = document.createElement('div');

  loader.id = 'page-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');
  loader.setAttribute('aria-label', 'Loading page');

  loader.innerHTML = `
    <div class="page-loader__content">
      <div class="page-loader__spinner" aria-hidden="true">
        <img
          class="page-loader__logo"
          src="/logo-icon.svg"
          alt=""
        />
      </div>

      <div class="page-loader__text">
        Loading<span class="page-loader__dots"></span>
      </div>
    </div>
  `;

  body.prepend(loader);

  let hasFinished = false;

  function revealPage() {
    if (hasFinished) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const elapsed = performance.now() - startTime;
    const delay = reducedMotion
      ? 0
      : Math.max(0, minimumDisplayTime - elapsed);

    window.setTimeout(() => {
      if (hasFinished) return;

      hasFinished = true;

      root.classList.remove('page-loader-active');
      body.classList.remove('page-loader-active');
      loader.classList.add('is-hidden');

      window.setTimeout(() => {
        loader.remove();
        styles.remove();
      }, reducedMotion ? 20 : 450);
    }, delay);
  }

  if (document.readyState === 'complete') {
    revealPage();
  } else {
    window.addEventListener('load', revealPage, {
      once: true
    });
  }

  window.setTimeout(revealPage, maximumDisplayTime);
})();
