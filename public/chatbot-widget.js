(function() {
  // Create and inject the chatbot widget as an iframe
  let root = document.getElementById('vbh-chatbot-root');
  if (!root) {
    // Create a root automatically if not present
    root = document.createElement('div');
    root.id = 'vbh-chatbot-root';
    document.body.appendChild(root);
  }

  // Extract chatbot origin from the script's own source URL
  const scriptSrc = document.currentScript?.src || document.querySelector('script[src*="chatbot-widget.js"]')?.src;
  const chatbotOrigin = scriptSrc ? new URL(scriptSrc).origin : 'https://4b482d74-c976-43c4-8d7d-de411c7ba68f.lovableproject.com';
  
  // Create iframe to load the chatbot app
  const iframe = document.createElement('iframe');
  iframe.src = chatbotOrigin + '/widget';
  iframe.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 80px; height: 80px; border: none; z-index: 2147483647; background: transparent; pointer-events: auto; display: block; transition: all 0.3s ease-in-out;';
  iframe.title = 'Value Build Homes Chatbot';
  iframe.allow = 'clipboard-write';
  
  // Listen for messages from the chatbot to resize the iframe
  window.addEventListener('message', function(event) {
    if (event.origin !== chatbotOrigin) return;
    
    if (event.data.type === 'chatbot-resize') {
      const { width, height, isOpen } = event.data;

      // Set iframe size to exact container size (no clamping needed for positioning)
      if (width) iframe.style.width = width + 'px';
      if (height) iframe.style.height = height + 'px';

      // Keep iframe anchored to bottom-right corner
      iframe.style.position = 'fixed';
      iframe.style.bottom = '20px';
      iframe.style.right = '20px';

      if (isOpen) {
        iframe.style.borderRadius = '0';
        iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      } else {
        iframe.style.borderRadius = '0';
        iframe.style.boxShadow = 'none';
      }
    }
  });
  
  // Mobile sizing is handled via chatbot-resize messages to avoid full-screen transparent overlays

  // Append to body to avoid clipping/overflow issues from parent containers
  document.body.appendChild(iframe);
})();
