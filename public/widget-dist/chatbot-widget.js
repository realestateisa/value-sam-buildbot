/**
 * VBH Widget Loader v2.1.0 - Active
 * Loads the VBH chatbot widget
 */
(function() {
  'use strict';
  
  console.log('[VBH Widget Loader] v2.1.0 - Loading widget');
  
  var currentScript = document.currentScript;
  var scriptSrc = currentScript?.src || document.querySelector('script[src*="chatbot-widget.js"]')?.src;
  
  if (scriptSrc) {
    var scriptUrl = new URL(scriptSrc);
    var basePath = scriptUrl.href.replace(/\/chatbot-widget\.js(\?.*)?$/, "/");
    var widgetScript = document.createElement('script');
    widgetScript.src = basePath + 'widget-dist/chatbot-widget-v2.js';
    widgetScript.async = true;
    document.head.appendChild(widgetScript);
  }
})();
