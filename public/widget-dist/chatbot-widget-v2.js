(function () {
  // VBH Widget Loader (v2 shim)
  // Purpose: keep backwards compatibility for sites embedding:
  //   /widget-dist/chatbot-widget-v2.js
  // This shim loads the canonical bundle:
  //   /widget-dist/chatbot-widget.js

  var currentScript = document.currentScript || document.querySelector('script[src*="chatbot-widget-v2.js"]');
  var scriptSrc = currentScript && currentScript.src ? currentScript.src : '';

  try {
    // Derive base origin from where this shim was loaded
    var base = scriptSrc ? new URL(scriptSrc) : null;
    var origin = base ? base.origin : window.location.origin;
    var canonicalUrl = origin + '/widget-dist/chatbot-widget.js';

    // Avoid double-loading
    if (window.__VBH_WIDGET_CANONICAL_LOADING__ || window.__VBH_WIDGET_CANONICAL_LOADED__) {
      return;
    }

    window.__VBH_WIDGET_CANONICAL_LOADING__ = true;

    // Load canonical bundle
    var s = document.createElement('script');
    s.src = canonicalUrl;
    s.async = true;

    s.onload = function () {
      window.__VBH_WIDGET_CANONICAL_LOADING__ = false;
      window.__VBH_WIDGET_CANONICAL_LOADED__ = true;

      // If canonical bundle doesn't auto-inject for any reason, ensure the element exists.
      // (Canonical bundle defines <vbh-chatbot> and typically auto-injects it.)
      if (!document.querySelector('vbh-chatbot')) {
        try {
          var el = document.createElement('vbh-chatbot');
          document.body.appendChild(el);
        } catch (e) {
          // no-op
        }
      }
    };

    s.onerror = function () {
      window.__VBH_WIDGET_CANONICAL_LOADING__ = false;
      // no-op: host site can inspect network to see failure
    };

    document.head.appendChild(s);
  } catch (e) {
    // no-op
  }
})();
