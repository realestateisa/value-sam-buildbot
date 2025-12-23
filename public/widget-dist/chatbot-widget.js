(function () {
  // Hotfix loader: ensure a real widget bundle is loaded (prevents self-referential infinite loop).
  // NOTE: This will be replaced by the actual built VBH bundle in CI.
  var scriptSrc =
    (document.currentScript && document.currentScript.src) ||
    (document.querySelector('script[src*="/widget-dist/chatbot-widget.js"]') || {}).src;

  var origin = scriptSrc ? new URL(scriptSrc).origin : window.location.origin;

  // Prevent double-inject
  if (window.__VBH_WIDGET_CANONICAL_LOADED) return;
  window.__VBH_WIDGET_CANONICAL_LOADED = true;

  // Load the existing bundled widget we know is present in /widget-dist.
  // This restores the chatbot on client sites immediately.
  var bundleSrc = origin + '/widget-dist/creekside-chatbot-widget.js';

  var s = document.createElement('script');
  s.src = bundleSrc;
  s.async = true;
  s.defer = true;
  s.dataset.vbhWidget = 'true';

  (document.head || document.documentElement).appendChild(s);
})();

