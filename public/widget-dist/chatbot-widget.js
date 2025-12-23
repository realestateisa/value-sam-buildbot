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
    var basePath = scriptUrl.href.replace(/\/widget-dist\/chatbot-widget\.js(\?.*)?$/, "/widget-dist/");
    var widgetScript = document.createElement('script');
    widgetScript.src = basePath + 'chatbot-widget-v2.js';
    widgetScript.async = true;
    document.head.appendChild(widgetScript);
  }
})();
