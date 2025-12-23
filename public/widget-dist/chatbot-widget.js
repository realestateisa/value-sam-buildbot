/**
 * VBH Widget Loader v2.2.0 - Simple Redirect
 * This loader simply loads the v2 bundle. No cleanup, no removal.
 */
(function() {
  'use strict';
  
  console.log('[VBH Widget Loader] v2.2.0 - Loading widget bundle');
  
  // Determine base path from this script's location
  var currentScript = document.currentScript;
  var scriptSrc = currentScript && currentScript.src;
  
  if (!scriptSrc) {
    // Fallback: try to find the script by selector
    var scripts = document.querySelectorAll('script[src*="chatbot-widget.js"]');
    if (scripts.length > 0) {
      scriptSrc = scripts[scripts.length - 1].src;
    }
  }
  
  if (scriptSrc) {
    try {
      var scriptUrl = new URL(scriptSrc);
      var basePath = scriptUrl.href.replace(/chatbot-widget\.js(\?.*)?$/, '');
      var v2BundleUrl = basePath + 'chatbot-widget-v2.js';
      
      // Check if v2 is already loaded
      var existingV2 = document.querySelector('script[src*="chatbot-widget-v2.js"]');
      if (existingV2) {
        console.log('[VBH Widget Loader] v2 bundle already loaded, skipping');
        return;
      }
      
      // Load the v2 bundle
      var widgetScript = document.createElement('script');
      widgetScript.src = v2BundleUrl;
      widgetScript.async = true;
      widgetScript.onload = function() {
        console.log('[VBH Widget Loader] v2 bundle loaded successfully');
      };
      widgetScript.onerror = function() {
        console.error('[VBH Widget Loader] Failed to load v2 bundle from:', v2BundleUrl);
      };
      document.head.appendChild(widgetScript);
      
      console.log('[VBH Widget Loader] Loading v2 bundle from:', v2BundleUrl);
    } catch (e) {
      console.error('[VBH Widget Loader] Error determining script path:', e);
    }
  } else {
    console.error('[VBH Widget Loader] Could not determine script source');
  }
})();
