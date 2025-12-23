// Value Build Homes Chatbot Widget Loader (v2 embed compatibility)
// Purpose: client sites embed:
//   <script src="https://vbh-chat-bot.com/widget-dist/chatbot-widget-v2.js" async></script>
// This loader pulls the canonical, self-contained widget bundle from jsDelivr.
// (Keeps the embed stable even if the host site isn't rebuilding widget-dist artifacts.)
(function () {
  var CDN_CANONICAL =
    "https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget.js";

  // Avoid double-loading
  if (window.__VBH_WIDGET_CANONICAL_LOADING__ || window.__VBH_WIDGET_CANONICAL_LOADED__) return;
  window.__VBH_WIDGET_CANONICAL_LOADING__ = true;

  var s = document.createElement("script");
  s.src = CDN_CANONICAL;
  s.async = true;

  s.onload = function () {
    window.__VBH_WIDGET_CANONICAL_LOADING__ = false;
    window.__VBH_WIDGET_CANONICAL_LOADED__ = true;

    // Ensure the web component exists if auto-inject was disabled or blocked.
    if (!document.querySelector("vbh-chatbot")) {
      try {
        var el = document.createElement("vbh-chatbot");
        document.body.appendChild(el);
      } catch (e) {
        // no-op
      }
    }
  };

  s.onerror = function () {
    window.__VBH_WIDGET_CANONICAL_LOADING__ = false;
  };

  document.head.appendChild(s);
})();
