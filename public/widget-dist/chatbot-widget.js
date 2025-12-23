(function () {
  // VBH Widget Loader v2.0.2
  // This loader injects the real widget bundle
  var LOADER_VERSION = '2.0.2';
  console.info('[VBH Widget] Loader v' + LOADER_VERSION + ' initializing...');

  var scriptSrc =
    document.currentScript && document.currentScript.src ||
    (document.querySelector('script[src*="chatbot-widget.js"]') || {}).src;

  var origin = scriptSrc ? new URL(scriptSrc).origin : window.location.origin;
  var bundleUrl = origin + '/widget-dist/chatbot-widget-bundle.js';

  // Avoid double-inject
  if (document.querySelector('script[data-vbh-widget-bundle="true"]')) {
    console.info('[VBH Widget] Bundle already loaded, skipping.');
    return;
  }

  var widgetScript = document.createElement('script');
  widgetScript.src = bundleUrl;
  widgetScript.async = true;
  widgetScript.defer = true;
  widgetScript.dataset.vbhWidgetBundle = 'true';

  widgetScript.onload = function() {
    console.info('[VBH Widget] Bundle loaded successfully from ' + bundleUrl);
  };

  widgetScript.onerror = function() {
    console.error('[VBH Widget] FAILED to load bundle from ' + bundleUrl);
    window.__VBH_WIDGET_LOADER_ERROR = 'Bundle failed to load: ' + bundleUrl;
  };

  document.head.appendChild(widgetScript);
})();
