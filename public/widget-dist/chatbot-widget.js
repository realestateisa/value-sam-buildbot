/**
 * Value Build Homes Chatbot Widget Loader
 * Loads the v2 script (Shadow DOM iframe embed) from the same directory.
 */
(function () {
  "use strict";

  var currentScript = document.currentScript;
  var scriptTag = document.querySelector('script[src*="chatbot-widget.js"]');
  var scriptSrc = (currentScript && currentScript.src) || (scriptTag && scriptTag.src) || "";

  if (!scriptSrc) {
    console.error("[VBH Widget] Could not determine script source");
    return;
  }

  var scriptUrl = new URL(scriptSrc);
  var basePath = scriptUrl.href.replace(/\/chatbot-widget\.js(\?.*)?$/, "/");

  var widgetScript = document.createElement("script");
  widgetScript.src = new URL("chatbot-widget-v2.js", basePath).toString();
  widgetScript.async = true;

  if (currentScript && currentScript.getAttribute("data-auto-inject") === "false") {
    widgetScript.setAttribute("data-auto-inject", "false");
  }

  widgetScript.onerror = function () {
    console.error("[VBH Widget] Failed to load widget script from:", widgetScript.src);
  };

  document.head.appendChild(widgetScript);
})();
