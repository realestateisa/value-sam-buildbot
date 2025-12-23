/**
 * Value Build Homes Chatbot Widget (v2)
 * Shadow DOM wrapper that embeds the /widget host in an iframe.
 * This file is intended to be directly embedded on client sites.
 *
 * Usage:
 *   <script src="https://vbh-chat-bot.com/widget-dist/chatbot-widget-v2.js" async></script>
 * Optional:
 *   <script ... data-auto-inject="false"></script>
 *   <vbh-chatbot></vbh-chatbot>
 */
(function () {
  "use strict";

  var WIDGET_HOST_PATH = "/widget";
  var ELEMENT_NAME = "vbh-chatbot";

  function getBaseOrigin() {
    // Prefer the script's origin so the widget works from any domain where this file is hosted.
    var currentScript = document.currentScript;
    var scriptSrc = (currentScript && currentScript.src) || "";
    if (!scriptSrc) return window.location.origin;
    try {
      return new URL(scriptSrc).origin;
    } catch (_e) {
      return window.location.origin;
    }
  }

  function ensureDefined() {
    if (customElements.get(ELEMENT_NAME)) return;

    function toCssSize(value, fallback) {
      if (!value) return fallback;
      // Accept "420", "420px", "80vw", "60vh" etc.
      return /^\d+$/.test(value) ? value + "px" : value;
    }

    class VBHChatbot extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return;

        var shadow = this.attachShadow({ mode: "open" });

        var style = document.createElement("style");
        style.textContent =
          ":host{all:initial;position:fixed;z-index:2147483647;right:16px;bottom:16px;width:var(--vbh-widget-width,420px);height:var(--vbh-widget-height,640px);max-width:calc(100vw - 32px);max-height:calc(100vh - 32px)}" +
          "iframe{width:100%;height:100%;border:0;background:transparent}" +
          "@media (max-width:480px){:host{right:0;bottom:0;width:100vw;height:100vh;max-width:100vw;max-height:100vh}}";

        var iframe = document.createElement("iframe");
        iframe.title = "Value Build Homes Chatbot";
        iframe.loading = "lazy";
        iframe.referrerPolicy = "no-referrer-when-downgrade";

        var origin = getBaseOrigin();
        iframe.src = origin + WIDGET_HOST_PATH;

        // Allow sizing via attributes: <vbh-chatbot width="420" height="640"></vbh-chatbot>
        var wAttr = this.getAttribute("width");
        var hAttr = this.getAttribute("height");
        if (wAttr) this.style.setProperty("--vbh-widget-width", toCssSize(wAttr, "420px"));
        if (hAttr) this.style.setProperty("--vbh-widget-height", toCssSize(hAttr, "640px"));

        shadow.appendChild(style);
        shadow.appendChild(iframe);
      }
    }

    customElements.define(ELEMENT_NAME, VBHChatbot);
  }

  function shouldAutoInject() {
    var currentScript = document.currentScript;
    if (!currentScript) return true;
    return currentScript.getAttribute("data-auto-inject") !== "false";
  }

  function inject() {
    ensureDefined();
    if (document.querySelector(ELEMENT_NAME)) return;
    document.body.appendChild(document.createElement(ELEMENT_NAME));
  }

  if (shouldAutoInject()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", inject);
    } else {
      inject();
    }
  } else {
    // Still define the element for manual placement.
    ensureDefined();
  }
})();
