(function() {
  // Extract chatbot origin from the script's own source URL
  const scriptSrc = document.currentScript?.src || document.querySelector('script[src*="creekside-chatbot-widget.js"]')?.src;
  const chatbotOrigin = scriptSrc ? new URL(scriptSrc).origin : 'https://value-sam-buildbot.lovable.app';
  
  // Create iframe to load the chatbot app
  const iframe = document.createElement('iframe');
  iframe.src = chatbotOrigin + '/embed-demo-creekside';
  iframe.style.cssText = 'position: fixed; bottom: 24px; right: 24px; width: 88px; height: 146px; border: none; z-index: 2147483647; background: transparent; pointer-events: auto; display: block; transition: all 0.3s ease-in-out; overflow: visible;';
  iframe.title = 'Creekside Homes Chatbot';
  iframe.allow = 'clipboard-write';
  
  // Listen for messages from the chatbot to resize the iframe
  window.addEventListener('message', function(event) {
    if (event.origin !== chatbotOrigin) return;
    
    if (event.data.type === 'chatbot-resize') {
      const { width, height, isOpen, isMobile } = event.data;

      if (isOpen && isMobile) {
        // Mobile full-screen
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.borderRadius = '0';
        iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      } else if (isOpen) {
        // Desktop positioned
        iframe.style.position = 'fixed';
        iframe.style.bottom = '24px';
        iframe.style.right = '24px';
        iframe.style.width = width + 'px';
        iframe.style.height = height + 'px';
        iframe.style.borderRadius = '0';
        iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      } else {
        // Closed button
        iframe.style.position = 'fixed';
        iframe.style.bottom = '24px';
        iframe.style.right = '24px';
        iframe.style.width = '88px';
        iframe.style.height = '146px';
        iframe.style.borderRadius = '0';
        iframe.style.boxShadow = 'none';
      }
    }
  });
  
  // Append to body to avoid clipping/overflow issues from parent containers
  document.body.appendChild(iframe);
})();
