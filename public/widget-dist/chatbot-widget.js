/**
 * Value Build Homes Chatbot Widget (canonical) Loader
 * @version 2.4.1 - 2025-12-23
 *
 * Stable embed URL:
 *   <script src="https://vbh-chat-bot.com/widget-dist/chatbot-widget.js" async></script>
 */
(function () {
  'use strict';

  const VERSION = '2.4.1';
  const CDN_BUNDLE =
    'https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget.js';

  if (window.__VBH_WIDGET_CANON_LOADING__ || window.__VBH_WIDGET_CANON_LOADED__) {
    return;
  }
  window.__VBH_WIDGET_CANON_LOADING__ = true;

  console.log(`[VBH Widget loader] v${VERSION} -> ${CDN_BUNDLE}`);

  const script = document.createElement('script');
  script.src = `${CDN_BUNDLE}?v=${encodeURIComponent(VERSION)}`;
  script.async = true;

  const currentScript = document.currentScript;
  if (currentScript?.getAttribute('data-auto-inject') === 'false') {
    script.setAttribute('data-auto-inject', 'false');
  }

  script.onload = function () {
    window.__VBH_WIDGET_CANON_LOADED__ = true;
    window.__VBH_WIDGET_CANON_LOADING__ = false;
  };

  script.onerror = function () {
    window.__VBH_WIDGET_CANON_LOADING__ = false;
    console.error('[VBH Widget loader] Failed to load CDN bundle:', script.src);
  };

  document.head.appendChild(script);
})();
