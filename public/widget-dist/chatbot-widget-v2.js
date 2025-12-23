// Value Build Homes Chatbot Widget Loader v2.0.3 (legacy URL)
// Kept for backwards compatibility - chains to stable loader
(function () {
  var VERSION = '2.0.3';
  var currentScript = document.currentScript;
  var scriptSrc = (currentScript && currentScript.src) || '';
  var origin = scriptSrc ? new URL(scriptSrc, window.location.href).origin : window.location.origin;
  var loaderUrl = origin + '/widget-dist/chatbot-widget.js';

  console.log('[VBH Widget v2 Shim] v' + VERSION + ' - loading stable loader from: ' + loaderUrl);

  var widgetScript = document.createElement('script');
  widgetScript.src = loaderUrl;
  widgetScript.async = true;

  widgetScript.onerror = function () {
    console.error('[VBH Widget v2 Shim] ERROR: Failed to load stable loader - ' + loaderUrl);
  };

  widgetScript.onload = function () {
    console.log('[VBH Widget v2 Shim] Stable loader loaded, bundle loading should follow...');
  };

  if (currentScript && currentScript.getAttribute('data-auto-inject') === 'false') {
    widgetScript.setAttribute('data-auto-inject', 'false');
  }

  document.head.appendChild(widgetScript);
})();
