/**
 * Value Build Homes Chatbot Widget v2
 * Embeds the chatbot as an iframe pointing to the Lovable deployment
 * @version 2.0.7 - 2025-12-23
 */
(function() {
  'use strict';
  
  // Prevent double-loading
  if (window.__VBH_CHATBOT_LOADED__) {
    console.log('[VBH Widget] v2.0.7 - Already loaded, skipping...');
    return;
  }
  window.__VBH_CHATBOT_LOADED__ = true;
  
  console.log('[VBH Widget] v2.0.7 - Initializing...');
  
  // The Lovable deployment origin for the chatbot app
  var CHATBOT_ORIGIN = 'https://4b482d74-c976-43c4-8d7d-de411c7ba68f.lovableproject.com';
  
  // Create root container if it doesn't exist
  var root = document.getElementById('vbh-chatbot-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'vbh-chatbot-root';
    document.body.appendChild(root);
  }
  
  // Create iframe to load the chatbot widget
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
  
  // Listen for resize messages from the chatbot
  window.addEventListener('message', function(event) {
    // Verify origin
    if (event.origin !== CHATBOT_ORIGIN) return;
    
    if (event.data && event.data.type === 'chatbot-resize') {
      var width = event.data.width;
      var height = event.data.height;
      var isOpen = event.data.isOpen;
      var isMobile = event.data.isMobile;
      
      if (isOpen && isMobile) {
        // Mobile full-screen mode
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.borderRadius = '0';
      } else if (isOpen) {
        // Desktop open mode
        iframe.style.top = '';
        iframe.style.left = '';
        iframe.style.bottom = '24px';
        iframe.style.right = '24px';
        iframe.style.width = width + 'px';
        iframe.style.height = height + 'px';
        iframe.style.borderRadius = '24px';
      } else {
        // Closed mode (just the button)
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
  console.log('[VBH Widget] v2.0.7 - Chatbot iframe created successfully');
})();
