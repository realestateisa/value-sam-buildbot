/**
 * VBH Widget v2 Compatibility Shim
 * This script loads the canonical widget bundle from chatbot-widget.js
 * Clients can safely use either URL - they get the same widget.
 */
(function() {
  'use strict';
  
  var VERSION = '2.0.2-shim';
  var LOG_PREFIX = '[VBH Widget Loader]';
  
  // Log shim load
  console.info(LOG_PREFIX, 'v' + VERSION + ' - loading canonical bundle...');
  
  // Prevent double-loading
  if (window.__VBH_WIDGET_LOADING || window.__VBH_WIDGET_VERSION) {
    console.info(LOG_PREFIX, 'Widget already loaded or loading, skipping.');
    return;
  }
  window.__VBH_WIDGET_LOADING = true;
  
  // Determine the base URL from this script's location
  var currentScript = document.currentScript;
  var scriptSrc = currentScript ? currentScript.src : '';
  var baseUrl = '';
  
  if (scriptSrc) {
    // Extract base URL from current script
    var urlParts = scriptSrc.split('/');
    urlParts.pop(); // Remove filename
    baseUrl = urlParts.join('/') + '/';
  } else {
    // Fallback: try to find the script tag
    var scripts = document.querySelectorAll('script[src*="chatbot-widget-v2.js"]');
    if (scripts.length > 0) {
      var src = scripts[0].src;
      var parts = src.split('/');
      parts.pop();
      baseUrl = parts.join('/') + '/';
    }
  }
  
  // Construct canonical bundle URL
  var canonicalUrl = baseUrl + 'chatbot-widget.js';
  
  console.info(LOG_PREFIX, 'Loading from:', canonicalUrl);
  
  // Create and inject the canonical script
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
  
  // Inject script
  (document.head || document.documentElement).appendChild(script);
})();
