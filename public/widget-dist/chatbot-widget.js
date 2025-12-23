/**
 * Value Build Homes Chatbot Widget (canonical loader)
 * Non-iframe: loads the Shadow DOM web component bundle.
 *
 * Clients may embed either:
 *  - /widget-dist/chatbot-widget.js (this file)
 *  - /widget-dist/chatbot-widget-v2.js (full bundle)
 *
 * @version 2.0.9 - 2025-12-23
 */
(function () {
  'use strict';

  var LOG_PREFIX = '[VBH Widget Loader]';

  // Prevent double-loading
  if (window.__VBH_WIDGET_LOADING__ || window.__VBH_WIDGET_LOADED__) {
    return;
  }
  window.__VBH_WIDGET_LOADING__ = true;

  // Resolve base URL from the current script
  var currentScript = document.currentScript;
  var scriptSrc = (currentScript && currentScript.src) || '';

  // Fallback: find our own script tag
  if (!scriptSrc) {
    var tags = document.querySelectorAll('script[src*="chatbot-widget.js"]');
    if (tags && tags.length) scriptSrc = tags[tags.length - 1].src;
  }

  if (!scriptSrc) {
    console.error(LOG_PREFIX, 'Could not determine script src');
    window.__VBH_WIDGET_LOADING__ = false;
    return;
  }

  var baseUrl = scriptSrc.replace(/\/chatbot-widget\.js(\?.*)?$/, '/');
  var bundleUrl = baseUrl + 'chatbot-widget-v2.js';

  // Avoid injecting the same bundle multiple times
  if (document.querySelector('script[data-vbh-widget-bundle="true"]')) {
    window.__VBH_WIDGET_LOADING__ = false;
    window.__VBH_WIDGET_LOADED__ = true;
    return;
  }

  var s = document.createElement('script');
  s.src = bundleUrl;
  s.async = true;
  s.dataset.vbhWidgetBundle = 'true';

  // Preserve data-auto-inject="false" if present
  if (currentScript && currentScript.getAttribute('data-auto-inject') === 'false') {
    s.setAttribute('data-auto-inject', 'false');
  }

  s.onload = function () {
    window.__VBH_WIDGET_LOADING__ = false;
    window.__VBH_WIDGET_LOADED__ = true;
    // console.info(LOG_PREFIX, 'Loaded bundle:', bundleUrl);
  };

  s.onerror = function () {
    console.error(LOG_PREFIX, 'Failed to load bundle:', bundleUrl);
    window.__VBH_WIDGET_LOADING__ = false;
  };

  (document.head || document.documentElement).appendChild(s);
})();
