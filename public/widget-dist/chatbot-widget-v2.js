// Value Build Homes Chatbot Widget (v2 embed)
// Clients embed:
//   <script src="https://vbh-chat-bot.com/widget-dist/chatbot-widget-v2.js" async></script>
//
// IMPORTANT: This script must NOT use an iframe. It loads the actual widget bundle
// (Shadow DOM custom element) and auto-injects <vbh-chatbot>.
(function () {
  "use strict";

  var LOG_PREFIX = "[VBH Widget]";

  // Avoid double-loading
  if (window.__VBH_WIDGET_V2_LOADING__ || window.__VBH_WIDGET_V2_LOADED__) return;
  window.__VBH_WIDGET_V2_LOADING__ = true;

  // If the custom element is already defined, we're done (the widget entry file
  // also auto-injects by default).
  try {
    if (window.customElements && window.customElements.get("vbh-chatbot")) {
      window.__VBH_WIDGET_V2_LOADING__ = false;
      window.__VBH_WIDGET_V2_LOADED__ = true;
      return;
    }
  } catch (_e) {}

  // Load the canonical widget *bundle* (IIFE build of src/widget-entry.tsx).
  // We intentionally load from jsDelivr so this URL always points to the latest
  // built artifact committed by CI.
  var BUNDLE_URL =
    "https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget.js";

  // Prevent recursion if this script is ever served from the same URL.
  try {
    var currentSrc = (document.currentScript && document.currentScript.src) || "";
    if (currentSrc && currentSrc.indexOf("cdn.jsdelivr.net") !== -1) {
      // On CDN, the bundle itself should be loaded directly by the page.
      window.__VBH_WIDGET_V2_LOADING__ = false;
      window.__VBH_WIDGET_V2_LOADED__ = true;
      return;
    }
  } catch (_e) {}

  var s = document.createElement("script");
  s.src = BUNDLE_URL;
  s.async = true;

  s.onload = function () {
    window.__VBH_WIDGET_V2_LOADING__ = false;
    window.__VBH_WIDGET_V2_LOADED__ = true;

    // Ensure there is a widget element present (the bundle also auto-injects,
    // but this makes embedding resilient if auto-inject is disabled later).
    try {
      if (!document.querySelector("vbh-chatbot")) {
        document.body.appendChild(document.createElement("vbh-chatbot"));
      }
    } catch (_e) {}
  };

  s.onerror = function () {
    window.__VBH_WIDGET_V2_LOADING__ = false;
    try {
      console.error(LOG_PREFIX, "Failed to load widget bundle:", BUNDLE_URL);
    } catch (_e) {}
  };

  (document.head || document.documentElement).appendChild(s);
})();
