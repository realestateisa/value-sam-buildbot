// Value Build Homes Chatbot Widget Loader (legacy v2 URL)
// Kept for backwards compatibility with older embeds.
(function () {
  var currentScript = document.currentScript;
  var scriptSrc = (currentScript && currentScript.src) || '';
  var origin = scriptSrc ? new URL(scriptSrc, window.location.href).origin : window.location.origin;

  // Legacy v2 should load the stable loader, which then loads the real bundle.
  var widgetScript = document.createElement('script');
  widgetScript.src = origin + '/widget-dist/chatbot-widget.js';
  widgetScript.async = true;

  // Preserve auto-inject setting
  if (currentScript && currentScript.getAttribute('data-auto-inject') === 'false') {
    widgetScript.setAttribute('data-auto-inject', 'false');
  }

  document.head.appendChild(widgetScript);
})();
