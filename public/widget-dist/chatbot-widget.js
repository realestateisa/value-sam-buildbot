(function () {
  // VBH Widget Loader v2.0.3
  // Loads the widget bundle from jsDelivr CDN
  var LOADER_VERSION = '2.0.3';
  console.info('[VBH Widget] Loader v' + LOADER_VERSION + ' initializing...');

  // Bundle URL from jsDelivr CDN (auto-updated by GitHub Actions)
  var bundleUrl = 'https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget-bundle.js';

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
    console.info('[VBH Widget] Bundle loaded successfully');
  };

  widgetScript.onerror = function() {
    console.error('[VBH Widget] FAILED to load bundle from ' + bundleUrl);
    window.__VBH_WIDGET_LOADER_ERROR = 'Bundle failed to load: ' + bundleUrl;
  };

  document.head.appendChild(widgetScript);
})();
