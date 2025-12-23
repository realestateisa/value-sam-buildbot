/**
 * VBH Widget v2 Compatibility Shim
 * This script loads the canonical widget bundle from chatbot-widget.js
 * Clients can safely use either URL - they get the same widget.
 */
(function() {
  'use strict';
  
  var VERSION = '2.0.2-shim';
  var LOG_PREFIX = '[VBH Widget Loader]';
  
  console.info(LOG_PREFIX, 'v' + VERSION + ' - loading canonical bundle...');
  
  if (window.__VBH_WIDGET_LOADING || window.__VBH_WIDGET_VERSION) {
    console.info(LOG_PREFIX, 'Widget already loaded or loading, skipping.');
    return;
  }
  window.__VBH_WIDGET_LOADING = true;
  
  var currentScript = document.currentScript;
  var scriptSrc = currentScript ? currentScript.src : '';
  var baseUrl = '';
  
  if (scriptSrc) {
    var urlParts = scriptSrc.split('/');
    urlParts.pop();
    baseUrl = urlParts.join('/') + '/';
  } else {
    var scripts = document.querySelectorAll('script[src*="chatbot-widget-v2.js"]');
    if (scripts.length > 0) {
      var src = scripts[0].src;
      var parts = src.split('/');
      parts.pop();
      baseUrl = parts.join('/') + '/';
    }
  }
  
  var canonicalUrl = baseUrl + 'chatbot-widget.js';
  console.info(LOG_PREFIX, 'Loading from:', canonicalUrl);
  
  var script = document.createElement('script');
  script.src = canonicalUrl;
  script.async = true;
  
  script.onload = function() {
    console.info(LOG_PREFIX, 'Canonical bundle loaded successfully');
    window.__VBH_WIDGET_LOADING = false;
  };
  
  script.onerror = function() {
    console.error(LOG_PREFIX, 'Failed to load canonical bundle from:', canonicalUrl);
    window.__VBH_WIDGET_LOADING = false;
  };
  
  (document.head || document.documentElement).appendChild(script);
})();
