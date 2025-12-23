/**
 * VBH Widget Loader v2.2.0 - Active
 * Loads the VBH chatbot widget (Shadow DOM, no iframe)
 */
(function () {
  'use strict';

  console.log('[VBH Widget Loader] v2.2.0 - Loading widget');

  var currentScript = document.currentScript;
  var scriptSrc = (currentScript && currentScript.src) || (document.querySelector('script[src*="chatbot-widget.js"]') || {}).src;

  if (!scriptSrc) return;

  var scriptUrl = new URL(scriptSrc);
  var basePath = scriptUrl.href.replace(/\/chatbot-widget\.js(\?.*)?$/, '/');

  // Always bypass CDN caches to guarantee the latest widget is fetched.
  // This avoids “stuck on old build” situations on client sites.
  var cacheBust = Date.now();

  var widgetScript = document.createElement('script');
  widgetScript.src = basePath + 'widget-dist/chatbot-widget-v2.js?v=2.2.0&t=' + cacheBust;
  widgetScript.async = true;
  document.head.appendChild(widgetScript);
})();
