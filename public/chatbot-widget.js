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
  iframe.src = chatbotOrigin;
  iframe.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; border: none; z-index: 9999; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);';
  iframe.title = 'Value Build Homes Chatbot';
  
  // Make iframe responsive on mobile
  if (window.innerWidth <= 768) {
    iframe.style.cssText = 'position: fixed; bottom: 0; right: 0; width: 100%; height: 100%; border: none; z-index: 9999;';
  }

  root.appendChild(iframe);
})();
