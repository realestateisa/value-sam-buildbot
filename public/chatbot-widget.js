// Value Build Homes Chatbot Widget Loader
// This is a convenience loader that redirects to the main widget bundle
(function () {
  var currentScript = document.currentScript;
  var scriptSrc = (currentScript && currentScript.src) || '';
  var origin = scriptSrc ? new URL(scriptSrc, window.location.href).origin : window.location.origin;

  var widgetScript = document.createElement('script');
  widgetScript.src = origin + '/widget-dist/chatbot-widget.js';
  widgetScript.async = true;

  // Preserve auto-inject setting
  if (currentScript && currentScript.getAttribute('data-auto-inject') === 'false') {
    widgetScript.setAttribute('data-auto-inject', 'false');
  }

  document.head.appendChild(widgetScript);
})();
