(function () {
  function initializePromoBanner() {
    if (document.querySelector('.site-promo-banner')) return;

    const styles = document.createElement('style');

    styles.textContent = `
      :root {
        --promo-banner-height: 58px;
      }

      body {
        padding-top: var(--promo-banner-height);
      }

      nav[aria-label="Main navigation"] {
        top: var(--promo-banner-height) !important;
      }

      .site-promo-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 500;
        width: 100%;
        border-bottom: 1px solid rgba(255,255,255,.16);
        background:
          linear-gradient(
            135deg,
            rgba(99,183,196,.98),
            rgba(68,127,140,.98)
          );
        color: #f7fbfc;
        box-shadow: 0 8px 24px rgba(0,0,0,.24);
        font-family: 'DM Sans', sans-serif;
      }

      .site-promo-banner__inner {
        width: min(1140px, calc(100% - 3rem));
        min-height: 58px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        padding: .55rem 0;
      }

      .site-promo-banner__copy {
        min-width: 0;
        text-align: center;
        font-size: .84rem;
        line-height: 1.35;
      }

      .site-promo-banner__copy strong {
        color: #fff;
        font-family: 'Instrument Sans', sans-serif;
        font-weight: 800;
      }

      .site-promo-banner__terms {
        display: block;
        margin-top: .12rem;
        color: rgba(255,255,255,.78);
        font-size: .65rem;
        line-height: 1.3;
      }

      .site-promo-banner__button {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: .57rem .9rem;
        border: 1px solid rgba(255,255,255,.42);
        border-radius: 8px;
        background: #eef1f8;
        color: #15313a;
        box-shadow:
          0 6px 16px rgba(0,0,0,.16),
          inset 0 1px 0 rgba(255,255,255,.8);
        font-size: .76rem;
        font-weight: 800;
        line-height: 1;
        text-decoration: none;
        white-space: nowrap;
        transition:
          transform .18s ease,
          background .18s ease,
          box-shadow .18s ease;
      }

      .site-promo-banner__button:hover {
        background: #fff;
        transform: translateY(-1px);
        box-shadow:
          0 8px 20px rgba(0,0,0,.2),
          inset 0 1px 0 rgba(255,255,255,.9);
      }

      .site-promo-banner__button:focus-visible {
        outline: 2px solid #fff;
        outline-offset: 3px;
      }

      @media (max-width: 760px) {
        .site-promo-banner__inner {
          width: calc(100% - 1.5rem);
          gap: .7rem;
          padding: .55rem 0;
        }

        .site-promo-banner__copy {
          text-align: left;
          font-size: .73rem;
          line-height: 1.25;
        }

        .site-promo-banner__terms {
          margin-top: .18rem;
          font-size: .57rem;
        }

        .site-promo-banner__button {
          padding: .55rem .65rem;
          font-size: .68rem;
        }
      }

      @media (max-width: 430px) {
        .site-promo-banner__inner {
          width: calc(100% - 1rem);
          gap: .45rem;
        }

        .site-promo-banner__copy {
          font-size: .67rem;
        }

        .site-promo-banner__terms {
          font-size: .53rem;
        }

        .site-promo-banner__button {
          padding: .5rem .55rem;
          font-size: .62rem;
        }
      }
    `;

    document.head.appendChild(styles);

    const banner = document.createElement('aside');

    banner.className = 'site-promo-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute(
      'aria-label',
      'Twenty-five percent web design offer'
    );

    banner.innerHTML = `
      <div class="site-promo-banner__inner">
        <div class="site-promo-banner__copy">
          <strong>
            You’ve supported us locally—now it’s our turn to support you.
          </strong>
          Save 25% on your first confirmed web design or development
          agreement of $150 or more.

          <span class="site-promo-banner__terms">
            One redemption per business or household. Cannot be combined
            with other discounts or promotions.
          </span>
        </div>

        <a
          class="site-promo-banner__button"
          href="mailto:connor@tekpair.com?subject=Claiming%2025%25%20Web%20Design%20Offer&amp;body=Hi%20Tekpair%2C%0A%0AI%27d%20like%20to%20request%20a%20quote%20and%20claim%20the%2025%25%20web%20design%20or%20development%20offer.%0A%0ABusiness%20name%3A%0AProject%20details%3A%0A"
        >
          Claim 25% Off
        </a>
      </div>
    `;

    document.body.prepend(banner);

    function updateBannerHeight() {
      const height = Math.ceil(banner.getBoundingClientRect().height);

      document.documentElement.style.setProperty(
        '--promo-banner-height',
        `${height}px`
      );
    }

    requestAnimationFrame(updateBannerHeight);
    window.addEventListener('resize', updateBannerHeight);

    if ('ResizeObserver' in window) {
      const bannerObserver = new ResizeObserver(updateBannerHeight);
      bannerObserver.observe(banner);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initializePromoBanner
    );
  } else {
    initializePromoBanner();
  }
})();
