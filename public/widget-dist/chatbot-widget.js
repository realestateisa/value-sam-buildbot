/**
 * Value Build Homes Chatbot Widget
 * Shadow DOM Web Component - loads from jsDelivr CDN
 * 
 * Note: This is a loader script. The actual widget bundle is built by
 * GitHub Actions and served from jsDelivr CDN.
 */
(function() {
  'use strict';
  
  var VERSION = '2.1.0';
  var LOG_PREFIX = '[VBH Widget]';
  
  console.info(LOG_PREFIX, 'v' + VERSION + ' - initializing...');
  
  // Prevent double loading
  if (window.__VBH_WIDGET_LOADED__) {
    console.info(LOG_PREFIX, 'Already loaded, skipping.');
    return;
  }
  window.__VBH_WIDGET_LOADED__ = true;
  
  // Check if custom element already registered
  if (window.customElements && window.customElements.get('vbh-chatbot')) {
    console.info(LOG_PREFIX, 'Custom element already registered.');
    injectWidget();
    return;
  }
  
  // Load the actual widget bundle from jsDelivr CDN
  var CDN_URL = 'https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget.js';
  
  // Detect if we're already being loaded from CDN to prevent infinite loop
  var currentSrc = '';
  try {
    currentSrc = document.currentScript ? document.currentScript.src : '';
  } catch(e) {}
  
  if (currentSrc.indexOf('cdn.jsdelivr.net') !== -1) {
    // We ARE the CDN bundle - should never reach here in production
    // as the real bundle replaces this file
    console.warn(LOG_PREFIX, 'Loaded from CDN but bundle not yet built. Please wait for GitHub Actions to complete.');
    return;
  }
  
  var script = document.createElement('script');
  script.src = CDN_URL;
  script.async = true;
  
  script.onload = function() {
    console.info(LOG_PREFIX, 'Bundle loaded from CDN');
    injectWidget();
  };
  
  script.onerror = function() {
    console.error(LOG_PREFIX, 'Failed to load bundle from CDN:', CDN_URL);
  };
  
  (document.head || document.documentElement).appendChild(script);
  
  function injectWidget() {
    if (!document.querySelector('vbh-chatbot')) {
      var widget = document.createElement('vbh-chatbot');
      document.body.appendChild(widget);
      console.info(LOG_PREFIX, 'Widget element injected');
    }
  }
})();
