// Value Build Homes Chatbot Widget (canonical)
// This file is served at:
//   https://vbh-chat-bot.com/widget-dist/chatbot-widget.js
// It injects an iframe that hosts the widget UI at /widget.
(function () {
  "use strict";

  var LOG_PREFIX = "[VBH Widget]";

  // Avoid double-injecting the iframe
  if (window.__VBH_IFRAME_WIDGET_LOADED__) return;
  window.__VBH_IFRAME_WIDGET_LOADED__ = true;

  var root = document.getElementById("vbh-chatbot-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "vbh-chatbot-root";
    document.body.appendChild(root);
  }

  // Resolve origin based on this script's URL
  var scriptSrc =
    (document.currentScript && document.currentScript.src) ||
    (document.querySelector('script[src*="/widget-dist/chatbot-widget.js"], script[src*="chatbot-widget.js"]') || {})
      .src ||
    "";

  var origin;
  try {
    origin = scriptSrc ? new URL(scriptSrc).origin : window.location.origin;
  } catch (_e) {
    origin = window.location.origin;
  }

  var iframe = document.createElement("iframe");
  iframe.src = origin + "/widget";
  iframe.title = "Value Build Homes Chatbot";
  iframe.allow = "clipboard-write";
  iframe.style.cssText =
    "position: fixed; bottom: 24px; right: 24px; width: 88px; height: 146px; border: none; z-index: 2147483647; background: transparent; pointer-events: auto; display: block; transition: all 0.3s ease-in-out; overflow: visible;";

  root.appendChild(iframe);

  // Resize based on messages from the iframe-hosted widget
  window.addEventListener("message", function (event) {
    if (event.origin !== origin) return;
    if (!event.data || event.data.type !== "chatbot-resize") return;

    var width = event.data.width;
    var height = event.data.height;
    var isOpen = event.data.isOpen;
    var isMobile = event.data.isMobile;

    if (isOpen && isMobile) {
      iframe.style.position = "fixed";
      iframe.style.top = "0";
      iframe.style.left = "0";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.borderRadius = "0";
      return;
    }

    iframe.style.position = "fixed";
    iframe.style.top = "";
    iframe.style.left = "";
    iframe.style.right = "24px";
    iframe.style.bottom = "24px";
    iframe.style.width = width + "px";
    iframe.style.height = height + "px";
    iframe.style.borderRadius = "16px";
  });

  try {
    console.info(LOG_PREFIX, "Loaded iframe widget host:", origin + "/widget");
  } catch (_e) {}
})();
