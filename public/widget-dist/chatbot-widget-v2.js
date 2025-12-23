/**
 * VBH Widget v2.0.7 - DISABLED / KILL SWITCH
 * This script removes any existing VBH widget elements and does nothing else.
 */
(function(){"use strict";console.log("[VBH Widget] v2.0.7 - Widget disabled, cleaning up");var s=["vbh-chatbot","#vbh-chatbot",".vbh-chatbot","#widget-container",".vbh-widget-container",'[id*="vbh"]','[class*="vbh-widget"]','iframe[src*="widget"]','iframe[src*="vbh"]','iframe[src*="chatbot"]'];s.forEach(function(e){try{document.querySelectorAll(e).forEach(function(n){n.remove()})}catch(t){}});document.querySelectorAll("*").forEach(function(e){if(e.shadowRoot){var n=e.shadowRoot.innerHTML||"";(n.includes("vbh")||n.includes("chatbot")||n.includes("widget"))&&e.remove()}});console.log("[VBH Widget] Cleanup complete")})();
