// Value Build Homes Chatbot Widget Loader (v2 embed compatibility)
// Clients embed:
//   <script src="https://vbh-chat-bot.com/widget-dist/chatbot-widget-v2.js" async></script>
// This loader loads the canonical widget script (chatbot-widget.js) from the same origin.
(function () {
  "use strict";

  var VERSION = "2.0.4-shim";
  var LOG_PREFIX = "[VBH Widget Loader]";

  if (window.__VBH_WIDGET_LOADING__ || window.__VBH_WIDGET_LOADED__) return;
  window.__VBH_WIDGET_LOADING__ = true;

  try {
    console.info(LOG_PREFIX, "v" + VERSION + " - loading canonical bundle...");
  } catch (_e) {}

  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var baseUrl = "";

  if (scriptSrc) {
    var urlParts = scriptSrc.split("/");
    urlParts.pop();
    baseUrl = urlParts.join("/") + "/";
  } else {
    var scripts = document.querySelectorAll('script[src*="chatbot-widget-v2.js"]');
    if (scripts.length > 0) {
      var src = scripts[0].src;
      var parts = src.split("/");
      parts.pop();
      baseUrl = parts.join("/") + "/";
    }
  }

  var canonicalUrl = baseUrl + "chatbot-widget.js";

  var s = document.createElement("script");
  s.src = canonicalUrl;
  s.async = true;
  s.defer = true;

  s.onload = function () {
    window.__VBH_WIDGET_LOADING__ = false;
    window.__VBH_WIDGET_LOADED__ = true;
  };

  s.onerror = function () {
    window.__VBH_WIDGET_LOADING__ = false;
    try {
      console.error(LOG_PREFIX, "Failed to load canonical bundle:", canonicalUrl);
    } catch (_e) {}
  };

  (document.head || document.documentElement).appendChild(s);
})();
