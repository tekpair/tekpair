(function () {
  'use strict';
  if (/^\/admin(\/|$)/.test(window.location.pathname)) return;

  var PATH = window.location.pathname.replace(/([^/])$/, '$1/');

  function act(href) {
    return href === '/' ? PATH === '/' : PATH.startsWith(href);
  }

  var BOOK = PATH === '/' ? '#booking' : '/#booking';

  var IC = {
    home:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    about:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    cal:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    policy:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    user:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  };

  // null = Book FAB (center)
  var ITEMS = [
    { href: '/',          label: 'Home',     ic: 'home'   },
    { href: '/about/',    label: 'About',    ic: 'about'  },
    null,
    { href: '/policies/', label: 'Policies', ic: 'policy' },
    { href: '/account/',  label: 'Account',  ic: 'user'   },
  ];

  var BG = '#13161d';

  var css =
    '#mnav{' +
      'position:fixed;top:auto;bottom:0;left:0;right:0;z-index:500;' +
      'display:none;align-items:stretch;' +
      'background:' + BG + ';' +
      'border-top:1px solid rgba(255,255,255,0.07);' +
      'border-radius:18px 18px 0 0;' +
      'box-shadow:0 -6px 28px rgba(0,0,0,0.55);' +
      'height:calc(64px + env(safe-area-inset-bottom,0px));' +
      'padding-bottom:env(safe-area-inset-bottom,0px);' +
      '-webkit-transform:translateZ(0);transform:translateZ(0);' +
      'will-change:transform;' +
    '}' +
    '@media(max-width:640px){' +
      '#mnav{display:flex;}' +
      '.nav-toggle{display:none!important;}' +
      '.mobile-menu,.mobile-menu.open{display:none!important;}' +
      'body{padding-bottom:calc(64px + env(safe-area-inset-bottom,0px))!important;}' +
      '#ck-banner{bottom:calc(64px + env(safe-area-inset-bottom,0px))!important;}' +
    '}' +
    '.mn-r{display:flex;align-items:stretch;width:100%;}' +
    '.mn-a{' +
      'flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'gap:3px;text-decoration:none;color:#4a5268;' +
      'font-family:"DM Sans",Arial,sans-serif;font-size:10px;font-weight:500;letter-spacing:0.01em;' +
      '-webkit-tap-highlight-color:transparent;touch-action:manipulation;' +
      'position:relative;transition:color 0.2s;' +
    '}' +
    '.mn-a svg{flex-shrink:0;transition:stroke 0.2s;}' +
    '.mn-a:active{opacity:0.6;}' +
    '.mn-a.on{color:#29d4f5;}' +
    '.mn-a.on svg{stroke:#29d4f5;}' +
    '.mn-a.on::after{' +
      'content:"";position:absolute;bottom:5px;' +
      'width:4px;height:4px;border-radius:50%;background:#29d4f5;' +
    '}' +
    '.mn-a span{display:block;white-space:nowrap;overflow:hidden;line-height:1;}' +
    '.mn-fw{flex:1;display:flex;align-items:center;justify-content:center;}' +
    '.mn-fab{' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'gap:2px;width:52px;height:52px;' +
      'background:#29d4f5;color:#0d0f14;' +
      'border-radius:14px;text-decoration:none;' +
      'font-family:"DM Sans",Arial,sans-serif;font-size:9.5px;font-weight:800;letter-spacing:0.02em;' +
      'box-shadow:0 0 0 3px ' + BG + ',0 4px 22px rgba(41,212,245,0.5);' +
      '-webkit-tap-highlight-color:transparent;touch-action:manipulation;' +
      'transition:opacity 0.18s,box-shadow 0.2s;' +
    '}' +
    '.mn-fab svg{stroke:#0d0f14!important;}' +
    '.mn-fab:active{opacity:0.8;}';

  var s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);

  var nav = document.createElement('div');
  nav.id = 'mnav';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main navigation');

  var row = document.createElement('div');
  row.className = 'mn-r';

  ITEMS.forEach(function (item) {
    if (!item) {
      var fw = document.createElement('div');
      fw.className = 'mn-fw';
      var fab = document.createElement('a');
      fab.href = BOOK;
      fab.className = 'mn-fab';
      fab.setAttribute('aria-label', 'Book a job');
      fab.innerHTML = IC.cal + '<span>Book</span>';
      fw.appendChild(fab);
      row.appendChild(fw);
    } else {
      var a = document.createElement('a');
      a.href = item.href;
      a.className = 'mn-a' + (act(item.href) ? ' on' : '');
      a.setAttribute('aria-label', item.label);
      a.innerHTML = IC[item.ic] + '<span>' + item.label + '</span>';
      row.appendChild(a);
    }
  });

  nav.appendChild(row);

  function mount() { document.body.appendChild(nav); }
  if (document.body) { mount(); }
  else { document.addEventListener('DOMContentLoaded', mount); }
}());
