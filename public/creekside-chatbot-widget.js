// Creekside Chatbot Widget Loader (Shadow DOM Version)
// This loads the Shadow DOM-based chatbot widget
(function() {
  // Extract origin from script source
  const scriptSrc = document.currentScript?.src || document.querySelector('script[src*="creekside-chatbot-widget.js"]')?.src;
  const origin = scriptSrc ? new URL(scriptSrc).origin : window.location.origin;
  
  // Load the actual Shadow DOM widget bundle
  const widgetScript = document.createElement('script');
  widgetScript.src = origin + '/widget-dist/creekside-chatbot-widget.js';
  widgetScript.async = true;
  
  // Preserve auto-inject setting
  const currentScript = document.currentScript;
  if (currentScript?.getAttribute('data-auto-inject') === 'false') {
    widgetScript.setAttribute('data-auto-inject', 'false');
  }
  
  document.head.appendChild(widgetScript);
})();
