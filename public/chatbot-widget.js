/**
 * Value Build Homes Chatbot Widget Loader
 * This script loads the main widget bundle from the widget-dist directory
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
  
  const origin = new URL(scriptSrc).origin;
  
  // Create and load the main widget script
  const widgetScript = document.createElement('script');
  widgetScript.src = origin + '/widget-dist/chatbot-widget-v2.js';
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
