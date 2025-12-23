/**
 * Value Build Homes Chatbot Widget v2
 * Shadow DOM Web Component - loads from jsDelivr CDN
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
  // This is built by GitHub Actions from src/widget-entry.tsx
  var CDN_URL = 'https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget.js';
  
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
    // Auto-inject the widget element if not already present
    if (!document.querySelector('vbh-chatbot')) {
      var widget = document.createElement('vbh-chatbot');
      document.body.appendChild(widget);
      console.info(LOG_PREFIX, 'Widget element injected');
    }
  }
})();
