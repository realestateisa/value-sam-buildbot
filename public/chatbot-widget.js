/**
 * VBH Widget Loader v2.0.7 - DISABLED / KILL SWITCH
 * This loader removes any existing VBH widget elements immediately.
 */
(function() {
  'use strict';
  
  console.log('[VBH Widget Loader] v2.0.7 - Widget disabled, cleaning up');
  
  // Immediately remove any existing VBH widget elements
  var selectors = [
    'vbh-chatbot',
    '#vbh-chatbot',
    '.vbh-chatbot',
    '#widget-container',
    '.vbh-widget-container',
    '[id*="vbh"]',
    '[class*="vbh-widget"]',
    'iframe[src*="widget"]',
    'iframe[src*="vbh"]',
    'iframe[src*="chatbot"]'
  ];
  
  selectors.forEach(function(selector) {
    try {
      var elements = document.querySelectorAll(selector);
      elements.forEach(function(el) {
        el.remove();
      });
    } catch (e) {}
  });
  
  // Also load the v2 bundle which has additional cleanup
  var currentScript = document.currentScript;
  var scriptSrc = currentScript?.src || document.querySelector('script[src*="chatbot-widget.js"]')?.src;
  
  if (scriptSrc) {
    var scriptUrl = new URL(scriptSrc);
    var basePath = scriptUrl.href.replace(/\/chatbot-widget\.js(\?.*)?$/, "/");
    var widgetScript = document.createElement('script');
    widgetScript.src = new URL('widget-dist/chatbot-widget-v2.js', basePath).toString();
    widgetScript.async = true;
    document.head.appendChild(widgetScript);
  }
  
  console.log('[VBH Widget Loader] Cleanup complete');
})();
