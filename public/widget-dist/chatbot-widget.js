/**
 * Value Build Homes Chatbot Widget Loader
 * This loader fetches the real Shadow DOM widget bundle from jsDelivr CDN
 * (Backwards compatibility - same as chatbot-widget-v2.js)
 */
(function() {
  // Prevent double-loading
  if (window.__VBH_WIDGET_LOADING__) {
    console.log('[VBH Widget Loader] Already loading, skipping...');
    return;
  }
  window.__VBH_WIDGET_LOADING__ = true;

  console.log('[VBH Widget Loader] v2.0 - Loading widget from CDN...');

  // Load the real widget bundle from jsDelivr (built by GitHub Actions)
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget.js';
  script.async = true;

  // Preserve data attributes from the original script tag
  var currentScript = document.currentScript;
  if (currentScript) {
    var autoInject = currentScript.getAttribute('data-auto-inject');
    if (autoInject === 'false') {
      script.setAttribute('data-auto-inject', 'false');
    }
  }

  script.onload = function() {
    console.log('[VBH Widget Loader] Widget loaded successfully from CDN');
  };

  script.onerror = function() {
    console.error('[VBH Widget Loader] Failed to load widget from CDN');
    window.__VBH_WIDGET_LOADING__ = false;
  };

  document.head.appendChild(script);
})();
