/**
 * Value Build Homes Chatbot Widget v2
 * Embeds the chatbot as an iframe pointing to this domain's /widget route
 * @version 2.0.8 - 2025-12-23
 */
(function () {
  'use strict';

  // Prevent double-loading
  if (window.__VBH_CHATBOT_LOADED__) {
    console.log('[VBH Widget] v2.0.8 - Already loaded, skipping...');
    return;
  }
  window.__VBH_CHATBOT_LOADED__ = true;

  console.log('[VBH Widget] v2.0.8 - Initializing...');

  // IMPORTANT: Use same-origin widget URL so the iframe is embeddable on client sites.
  // (Cross-site iframes are often blocked by frame-ancestors / X-Frame-Options.)
  var CHATBOT_ORIGIN = 'https://vbh-chat-bot.com';

  var root = document.getElementById('vbh-chatbot-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'vbh-chatbot-root';
    document.body.appendChild(root);
  }

  var iframe = document.createElement('iframe');
  iframe.src = CHATBOT_ORIGIN + '/widget';
  iframe.id = 'vbh-chatbot-iframe';
  iframe.title = 'Value Build Homes Chatbot';
  iframe.allow = 'clipboard-write';
  iframe.style.cssText = [
    'position: fixed',
    'bottom: 24px',
    'right: 24px',
    'width: 88px',
    'height: 146px',
    'border: none',
    'z-index: 2147483647',
    'background: transparent',
    'pointer-events: auto',
    'display: block',
    'transition: all 0.3s ease-in-out',
    'overflow: visible'
  ].join('; ') + ';';

  window.addEventListener('message', function (event) {
    if (event.origin !== CHATBOT_ORIGIN) return;

    if (event.data && event.data.type === 'chatbot-resize') {
      var width = event.data.width;
      var height = event.data.height;
      var isOpen = event.data.isOpen;
      var isMobile = event.data.isMobile;

      if (isOpen && isMobile) {
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.borderRadius = '0';
      } else if (isOpen) {
        iframe.style.top = '';
        iframe.style.left = '';
        iframe.style.bottom = '24px';
        iframe.style.right = '24px';
        iframe.style.width = width + 'px';
        iframe.style.height = height + 'px';
        iframe.style.borderRadius = '24px';
      } else {
        iframe.style.top = '';
        iframe.style.left = '';
        iframe.style.bottom = '24px';
        iframe.style.right = '24px';
        iframe.style.width = '88px';
        iframe.style.height = '146px';
        iframe.style.borderRadius = '0';
      }
    }
  });

  root.appendChild(iframe);
  console.log('[VBH Widget] v2.0.8 - Chatbot iframe created successfully');
})();
