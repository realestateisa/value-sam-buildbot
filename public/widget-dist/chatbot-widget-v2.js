/**
 * Value Build Homes Chatbot Widget v2 Loader
 * @version 2.4.1 - 2025-12-23
 *
 * IMPORTANT: The client embed MUST remain stable:
 *   <script src="https://vbh-chat-bot.com/widget-dist/chatbot-widget-v2.js" async></script>
 *
 * This file is a small loader that forwards to the latest built bundle on jsDelivr.
 * That keeps the embed URL unchanged while still allowing us to ship updates (like
 * the inlined VBH logo) immediately.
 */
(function () {
  'use strict';

  const VERSION = '2.4.1';
  const CDN_BUNDLE =
    'https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget-v2.js';

  // Avoid double-loading
  if (window.__VBH_WIDGET_V2_LOADING__ || window.__VBH_WIDGET_V2_LOADED__) {
    return;
  }
  window.__VBH_WIDGET_V2_LOADING__ = true;

  console.log(`[VBH Widget loader] v${VERSION} -> ${CDN_BUNDLE}`);

  const script = document.createElement('script');
  script.src = `${CDN_BUNDLE}?v=${encodeURIComponent(VERSION)}`;
  script.async = true;

  // Preserve data-auto-inject attribute if set on THIS loader script
  const currentScript = document.currentScript;
  if (currentScript?.getAttribute('data-auto-inject') === 'false') {
    script.setAttribute('data-auto-inject', 'false');
  }

  script.onload = function () {
    window.__VBH_WIDGET_V2_LOADED__ = true;
    window.__VBH_WIDGET_V2_LOADING__ = false;
  };

  script.onerror = function () {
    window.__VBH_WIDGET_V2_LOADING__ = false;
    console.error('[VBH Widget loader] Failed to load CDN bundle:', script.src);
  };

  document.head.appendChild(script);
})();
