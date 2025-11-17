(function() {
  // Create and inject the chatbot widget as an iframe
  const root = document.getElementById('vbh-chatbot-root');
  if (!root) {
    console.error('vbh-chatbot-root element not found');
    return;
  }

  // Extract chatbot origin from the script's own source URL
  const scriptSrc = document.currentScript?.src || document.querySelector('script[src*="chatbot-widget.js"]')?.src;
  const chatbotOrigin = scriptSrc ? new URL(scriptSrc).origin : 'https://4b482d74-c976-43c4-8d7d-de411c7ba68f.lovableproject.com';
  
  // Create iframe to load the chatbot app
  const iframe = document.createElement('iframe');
  iframe.src = chatbotOrigin + '/widget';
  iframe.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 280px; height: 150px; border: none; z-index: 9999; background: transparent; transition: all 0.3s ease-in-out;';
  iframe.title = 'Value Build Homes Chatbot';
  iframe.allow = 'clipboard-write';
  
  // Listen for messages from the chatbot to resize the iframe
  window.addEventListener('message', function(event) {
    if (event.origin !== chatbotOrigin) return;
    
    if (event.data.type === 'chatbot-resize') {
      const { width, height, isOpen } = event.data;
      if (width) iframe.style.width = width + 'px';
      if (height) iframe.style.height = height + 'px';

      if (isOpen) {
        iframe.style.borderRadius = '0';
        iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      } else {
        iframe.style.borderRadius = '0';
        iframe.style.boxShadow = 'none';
      }
    }
  });
  
  // Make iframe responsive on mobile
  if (window.innerWidth <= 768) {
    iframe.style.cssText = 'position: fixed; bottom: 0; right: 0; width: 100%; height: 100%; border: none; z-index: 9999;';
  }

  root.appendChild(iframe);
})();
