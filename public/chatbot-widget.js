/**
 * VBH Widget Loader v2.3.0 - Active
 * Loads the VBH chatbot widget (Shadow DOM, no iframe)
 * Also injects a global host override to neutralize any legacy “hide widget” CSS.
 */
(function () {
  'use strict';

  console.log('[VBH Widget Loader] v2.3.0 - Loading widget');

  // 1) Force the custom element to be visible even if the host site has legacy kill-switch CSS
  var styleId = 'vbh-widget-host-override';
  if (!document.getElementById(styleId)) {
    var hostStyle = document.createElement('style');
    hostStyle.id = styleId;
    hostStyle.textContent =
      'vbh-chatbot{' +
      'display:block !important;' +
      'visibility:visible !important;' +
      'opacity:1 !important;' +
      'pointer-events:auto !important;' +
      'position:fixed !important;' +
      'inset:auto !important;' +
      'right:0 !important;' +
      'bottom:0 !important;' +
      'z-index:2147483647 !important;' +
      '}' +
      'vbh-chatbot[hidden]{display:block !important;}';
    document.head.appendChild(hostStyle);
  }

  // 2) Load the actual widget bundle
  var currentScript = document.currentScript;
  var scriptSrc = (currentScript && currentScript.src) || (document.querySelector('script[src*="chatbot-widget.js"]') || {}).src;
  if (!scriptSrc) return;

  var scriptUrl = new URL(scriptSrc);
  var basePath = scriptUrl.href.replace(/\/chatbot-widget\.js(\?.*)?$/, '/');

  // Always bypass CDN caches to guarantee the latest widget is fetched.
  var cacheBust = Date.now();

  var widgetScript = document.createElement('script');
  widgetScript.src = basePath + 'widget-dist/chatbot-widget-v2.js?v=2.3.0&t=' + cacheBust;
  widgetScript.async = true;
  document.head.appendChild(widgetScript);
})();
