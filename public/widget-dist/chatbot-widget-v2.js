(function() {
  'use strict';
  
  // Create the Shadow DOM web component
  class ValueBuildChatbot extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
      // Create iframe inside Shadow DOM for complete isolation
      const iframe = document.createElement('iframe');
      const origin = 'https://4b482d74-c976-43c4-8d7d-de411c7ba68f.lovableproject.com';
      
      iframe.src = origin + '/widget';
      iframe.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 88px;
        height: 146px;
        border: none;
        z-index: 2147483647;
        background: transparent;
        pointer-events: auto;
        display: block;
        transition: all 0.3s ease-in-out;
        overflow: visible;
      `;
      iframe.title = 'Value Build Homes Chatbot';
      iframe.allow = 'clipboard-write';
      
      // Listen for resize messages
      window.addEventListener('message', (event) => {
        if (event.origin !== origin) return;
        
        if (event.data.type === 'chatbot-resize') {
          const { width, height, isOpen } = event.data;
          
          if (width) iframe.style.width = width + 'px';
          if (height) iframe.style.height = height + 'px';
          
          iframe.style.position = 'fixed';
          iframe.style.bottom = '24px';
          iframe.style.right = '24px';
          
          if (isOpen) {
            iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
          } else {
            iframe.style.boxShadow = 'none';
          }
        }
      });
      
      this.shadowRoot.appendChild(iframe);
    }
  }
  
  // Register custom element
  if (!customElements.get('vbh-chatbot')) {
    customElements.define('vbh-chatbot', ValueBuildChatbot);
  }
  
  // Auto-inject the widget
  function injectWidget() {
    if (document.querySelector('vbh-chatbot')) return;
    
    const widget = document.createElement('vbh-chatbot');
    document.body.appendChild(widget);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
  } else {
    injectWidget();
  }
})();
