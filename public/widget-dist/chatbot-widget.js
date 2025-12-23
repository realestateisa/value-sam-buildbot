/**
 * Value Build Homes Chatbot Widget Loader
 * This script loads the main widget bundle from the widget-dist directory
 * @version 1.0.1 - 2025-12-23 - Trigger rebuild for logo inlining
 */
(function() {
  'use strict';
  
  // Get the base URL from the current script's location
  const currentScript = document.currentScript;
  const scriptSrc = currentScript?.src || document.querySelector('script[src*="chatbot-widget.js"]')?.src;
  
  if (!scriptSrc) {
    console.error('[VBH Widget] Could not determine script source');
    return;
  }
  
  const scriptUrl = new URL(scriptSrc);

  // Base path is the directory containing this loader file.
  // On jsDelivr this is typically: .../public/
  const basePath = scriptUrl.href.replace(/\/chatbot-widget\.js(\?.*)?$/, "/");

  // Create and load the main widget script (v2 embed)
  const widgetScript = document.createElement('script');
  widgetScript.src = new URL('widget-dist/chatbot-widget-v2.js', basePath).toString();
  widgetScript.async = true;
  
  // Preserve data-auto-inject attribute if set
  if (currentScript?.getAttribute('data-auto-inject') === 'false') {
    widgetScript.setAttribute('data-auto-inject', 'false');
  }
  
  widgetScript.onerror = function() {
    console.error('[VBH Widget] Failed to load widget bundle from:', widgetScript.src);
  };
  
  document.head.appendChild(widgetScript);
})();
