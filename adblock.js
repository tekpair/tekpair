(function () {
  'use strict';

  /* ── Detection ─────────────────────────────────────────────────────────────
   * uBlock Origin uses $script type network filters, NOT $fetch/$xhr filters.
   * So fetch() requests to ad URLs can resolve even when ads are blocked.
   * Fix: load the ad URL as a real <script> element — uBlock's $script filter
   * cancels it, the browser fires onerror, we catch it and show the overlay.
   * DOM bait covers cosmetic-filter blockers (AdBlock Plus element hiding).
   * ───────────────────────────────────────────────────────────────────────── */

  function domBaitBlocked() {
    var bait = document.createElement('div');
    bait.setAttribute('class', 'ad ads adsense adsbygoogle pub_300x250 pub_728x90 banner-ad advertisement');
    bait.style.cssText = 'width:1px;height:1px;position:fixed;top:0;left:-9999px;pointer-events:none;';
    document.body.appendChild(bait);
    var cs = window.getComputedStyle(bait);
    var blocked = cs.display === 'none' || cs.visibility === 'hidden' ||
                  cs.opacity === '0' || bait.offsetHeight === 0 || bait.offsetWidth === 0;
    document.body.removeChild(bait);
    return blocked;
  }

  function isBlocked(callback) {
    var done = false;
    function result(blocked) {
      if (done) return;
      done = true;
      callback(blocked);
    }

    // Method 1: DOM bait (catches cosmetic / element-hiding filters)
    if (domBaitBlocked()) { result(true); return; }

    // Method 2: <script> element load — uBlock cancels $script requests and
    // the browser fires onerror. fetch() won't work because uBlock's EasyList
    // filters use $script type, not $fetch.
    var bait = document.createElement('script');
    bait.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?check=' + Date.now();
    bait.onload = function () {
      if (bait.parentNode) bait.parentNode.removeChild(bait);
      result(false);
    };
    bait.onerror = function () {
      if (bait.parentNode) bait.parentNode.removeChild(bait);
      result(true);
    };
    document.head.appendChild(bait);

    // Timeout — if neither fires within 5s treat as blocked
    setTimeout(function () { result(true); }, 5000);
  }

  /* ── Styles ─────────────────────────────────────────────────────────────── */
  var CSS = [
    '#tk-ab-overlay{',
      'position:fixed;inset:0;z-index:2147483647;',
      'background:rgba(17,19,24,0.97);',
      'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
      'display:flex;align-items:center;justify-content:center;',
      'padding:1.5rem;',
      'font-family:"DM Sans","Helvetica Neue",Arial,sans-serif;',
    '}',
    '#tk-ab-card{',
      'background:#1b1e26;',
      'border:1px solid rgba(255,255,255,0.10);',
      'border-radius:18px;',
      'max-width:540px;width:100%;',
      'padding:2.4rem 2.4rem 2rem;',
      'text-align:center;',
      'box-shadow:0 24px 80px rgba(0,0,0,0.6);',
    '}',
    '.tk-ab-icon{',
      'width:52px;height:52px;',
      'background:rgba(41,212,245,0.10);',
      'border-radius:50%;',
      'display:flex;align-items:center;justify-content:center;',
      'margin:0 auto 1.3rem;',
    '}',
    '#tk-ab-card h2{',
      'font-size:1.35rem;font-weight:700;',
      'color:#eef1f8;',
      'margin:0 0 0.6rem;line-height:1.25;',
    '}',
    '.tk-ab-sub{font-size:0.92rem;color:#9aa3b8;line-height:1.6;margin:0 0 1.8rem;}',
    '#tk-ab-steps{',
      'text-align:left;',
      'background:rgba(255,255,255,0.04);',
      'border:1px solid rgba(255,255,255,0.07);',
      'border-radius:12px;',
      'padding:1.2rem 1.4rem;',
      'margin-bottom:1.6rem;',
    '}',
    '#tk-ab-steps h3{',
      'font-size:0.7rem;font-weight:700;',
      'letter-spacing:0.12em;text-transform:uppercase;',
      'color:#29d4f5;margin:0 0 1rem;',
    '}',
    '.tk-ab-blocker{margin-bottom:1rem;}',
    '.tk-ab-blocker:last-child{margin-bottom:0;}',
    '.tk-ab-blocker-name{font-size:0.8rem;font-weight:700;color:#eef1f8;margin-bottom:0.3rem;}',
    '.tk-ab-blocker ol{margin:0;padding-left:1.25rem;font-size:0.83rem;color:#9aa3b8;line-height:1.6;}',
    '.tk-ab-divider{height:1px;background:rgba(255,255,255,0.07);margin:0.9rem 0;}',
    '#tk-ab-btn{',
      'display:block;width:100%;',
      'background:#29d4f5;color:#0e1117;',
      'font-family:inherit;font-size:0.95rem;font-weight:700;',
      'border:none;border-radius:10px;',
      'padding:0.85rem 1.5rem;',
      'cursor:pointer;transition:opacity 0.18s;',
    '}',
    '#tk-ab-btn:hover{opacity:0.88;}',
    '#tk-ab-btn:disabled{opacity:0.5;cursor:default;}',
    '#tk-ab-note{font-size:0.78rem;color:#767f92;margin-top:0.85rem;line-height:1.5;}'
  ].join('');

  /* ── Overlay HTML ────────────────────────────────────────────────────────── */
  var OVERLAY_HTML = [
    '<div id="tk-ab-card">',
      '<div class="tk-ab-icon">',
        '<svg width="24" height="24" fill="none" stroke="#29d4f5" stroke-width="2"',
          ' stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">',
          '<circle cx="12" cy="12" r="10"/>',
          '<line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>',
        '</svg>',
      '</div>',
      '<h2>Please allow ads on Tekpair</h2>',
      '<p class="tk-ab-sub">Our guides are free and always will be. Ads are the only thing keeping',
        ' this running. Your ad blocker is currently preventing them from loading.</p>',
      '<div id="tk-ab-steps">',
        '<h3>How to allow ads on tekpair.com</h3>',
        '<div class="tk-ab-blocker">',
          '<div class="tk-ab-blocker-name">uBlock Origin</div>',
          '<ol>',
            '<li>Click the <strong>uBlock Origin</strong> icon in your toolbar</li>',
            '<li>Click the large <strong>blue power button</strong> to disable for this site</li>',
            '<li>Click <strong>Reload</strong> when it appears</li>',
          '</ol>',
        '</div>',
        '<div class="tk-ab-divider"></div>',
        '<div class="tk-ab-blocker">',
          '<div class="tk-ab-blocker-name">AdBlock / AdBlock Plus</div>',
          '<ol>',
            '<li>Click the <strong>AdBlock</strong> icon in your toolbar</li>',
            '<li>Select <strong>"Don\'t run on pages on this domain"</strong></li>',
            '<li>Reload the page</li>',
          '</ol>',
        '</div>',
        '<div class="tk-ab-divider"></div>',
        '<div class="tk-ab-blocker">',
          '<div class="tk-ab-blocker-name">Brave Browser (Shields)</div>',
          '<ol>',
            '<li>Click the <strong>Shields icon</strong> (lion) in the address bar</li>',
            '<li>Toggle <strong>Shields</strong> to off for tekpair.com</li>',
            '<li>The page will reload automatically</li>',
          '</ol>',
        '</div>',
        '<div class="tk-ab-divider"></div>',
        '<div class="tk-ab-blocker">',
          '<div class="tk-ab-blocker-name">Other ad blockers</div>',
          '<ol>',
            '<li>Find your ad blocker icon in the browser toolbar</li>',
            '<li>Look for "Disable for this site", "Pause", or "Whitelist"</li>',
            '<li>Reload the page and click the button below</li>',
          '</ol>',
        '</div>',
      '</div>',
      '<button id="tk-ab-btn" type="button">I\'ve disabled my ad blocker — let me in</button>',
      '<p id="tk-ab-note">Already disabled it? Click the button above to check again.<br>',
        'Full reload may help: <strong>Ctrl+Shift+R</strong> (Windows/Linux) / <strong>Cmd+Shift+R</strong> (Mac)</p>',
    '</div>'
  ].join('');

  /* ── Mount / unmount ─────────────────────────────────────────────────────── */
  function showOverlay() {
    if (document.getElementById('tk-ab-overlay')) return;
    var style = document.createElement('style');
    style.id = 'tk-ab-style';
    style.textContent = CSS;
    document.head.appendChild(style);
    var overlay = document.createElement('div');
    overlay.id = 'tk-ab-overlay';
    overlay.innerHTML = OVERLAY_HTML;
    document.body.appendChild(overlay);
    document.documentElement.style.overflow = 'hidden';
  }

  function hideOverlay() {
    var el = document.getElementById('tk-ab-overlay');
    if (el) el.remove();
    var st = document.getElementById('tk-ab-style');
    if (st) st.remove();
    document.documentElement.style.overflow = '';
  }

  function check(onComplete) {
    isBlocked(function (blocked) {
      if (blocked) { showOverlay(); } else { hideOverlay(); }
      if (onComplete) onComplete(blocked);
    });
  }

  /* ── Re-check button ─────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (!e.target || e.target.id !== 'tk-ab-btn') return;
    var btn = e.target;
    btn.disabled = true;
    btn.textContent = 'Checking…';
    check(function (blocked) {
      if (blocked) {
        btn.disabled = false;
        btn.textContent = 'Still blocked — try again';
      }
    });
  });

  /* ── Init ────────────────────────────────────────────────────────────────── */
  function init() { setTimeout(check, 500); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
