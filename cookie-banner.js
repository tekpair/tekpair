(function () {
  if (localStorage.getItem('tekpair_consent')) return;

  var css = '#ck-banner{position:fixed;bottom:0;left:0;right:0;z-index:600;background:#13161d;border-top:1px solid rgba(255,255,255,0.08);padding:0.85rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;font-family:"DM Sans",Arial,sans-serif;font-size:0.84rem;color:#8a95b0;box-shadow:0 -4px 24px rgba(0,0,0,0.5);}' +
    '#ck-banner a{color:#29d4f5;text-decoration:none;}' +
    '#ck-banner a:hover{text-decoration:underline;}' +
    '#ck-accept{background:#29d4f5;color:#0d0f14;border:none;padding:0.45rem 1.2rem;border-radius:8px;font-weight:700;font-size:0.84rem;cursor:pointer;font-family:"DM Sans",Arial,sans-serif;white-space:nowrap;flex-shrink:0;transition:opacity 0.18s;}' +
    '#ck-accept:hover{opacity:0.85;}';

  var s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);

  var b = document.createElement('div');
  b.id = 'ck-banner';
  b.innerHTML = '<span>We use cookies and analytics tools — including session recording via Microsoft Clarity — to improve this site. By continuing, you agree to our <a href="/privacy/">Privacy Policy</a>.</span>';

  var btn = document.createElement('button');
  btn.id = 'ck-accept';
  btn.textContent = 'Got it';
  btn.onclick = function () {
    localStorage.setItem('tekpair_consent', '1');
    b.style.transition = 'opacity 0.25s';
    b.style.opacity = '0';
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 280);
  };
  b.appendChild(btn);

  function mount() { document.body.appendChild(b); }
  if (document.body) { mount(); } else { document.addEventListener('DOMContentLoaded', mount); }
}());
