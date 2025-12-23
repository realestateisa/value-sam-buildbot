/**
 * VBH Widget Bundle Placeholder
 * 
 * This file should be replaced by the actual built widget bundle during CI/CD.
 * If you're seeing this message, the build hasn't completed yet.
 * 
 * For immediate use, embed the jsDelivr CDN version instead:
 * <script src="https://cdn.jsdelivr.net/gh/AaronALight/value-build-bot@main/public/widget-dist/chatbot-widget.js"></script>
 */
(function() {
  'use strict';
  
  var LOG_PREFIX = '[VBH Widget]';
  
  // Check if already loaded
  if (window.__VBH_WIDGET_VERSION) {
    console.info(LOG_PREFIX, 'Already loaded, skipping.');
    return;
  }
  
  console.warn(LOG_PREFIX, 'Placeholder file detected. The built widget bundle should replace this file during deployment.');
  console.info(LOG_PREFIX, 'Attempting to load from jsDelivr CDN as fallback...');
  
  // Fallback: load from jsDelivr CDN
  var cdnUrl = 'https://cdn.jsdelivr.net/gh/AaronALight/value-build-bot@main/dist/chatbot-widget.js';
  
  var script = document.createElement('script');
  script.src = cdnUrl;
  script.async = true;
  
  script.onload = function() {
    console.info(LOG_PREFIX, 'Loaded from CDN fallback');
  };
  
  script.onerror = function() {
    console.error(LOG_PREFIX, 'Failed to load widget from CDN. Please check the deployment.');
  };
  
  (document.head || document.documentElement).appendChild(script);
})();
