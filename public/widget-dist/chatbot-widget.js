// Value Build Homes Chatbot Widget Loader (Shadow DOM Version)
// This loader fetches the self-contained web component bundle from /widget-dist/
(function () {
  var currentScript = document.currentScript;
  var scriptSrc = (currentScript && currentScript.src) || (document.querySelector('script[src*="chatbot-widget.js"]') && document.querySelector('script[src*="chatbot-widget.js"]').getAttribute('src')) || '';
  var origin = scriptSrc ? new URL(scriptSrc, window.location.href).origin : window.location.origin;

  var widgetScript = document.createElement('script');
  widgetScript.src = origin + '/widget-dist/chatbot-widget-v2.js';
  widgetScript.async = true;

  // Preserve auto-inject setting
  if (currentScript && currentScript.getAttribute('data-auto-inject') === 'false') {
    widgetScript.setAttribute('data-auto-inject', 'false');
  }

  document.head.appendChild(widgetScript);
})();

