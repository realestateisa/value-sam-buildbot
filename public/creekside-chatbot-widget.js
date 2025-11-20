(function() {
  // Configuration - Use your deployed Lovable app URL
  const WIDGET_SRC = 'https://value-sam-buildbot.lovable.app/embed-demo-creekside';
  const WIDGET_ID = 'creekside-chatbot-embed';
  
  // Check if widget already exists
  if (document.getElementById(WIDGET_ID)) {
    console.warn('Creekside chatbot widget already loaded');
    return;
  }

  // Create container
  const container = document.createElement('div');
  container.id = WIDGET_ID;
  container.style.cssText = 'position: fixed; bottom: 0; right: 0; z-index: 999999;';
  
  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = WIDGET_SRC;
  iframe.style.cssText = 'border: none; width: 100vw; height: 100vh; position: fixed; bottom: 0; right: 0;';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('title', 'Creekside Homes Chatbot');
  
  // Handle resize messages from the iframe
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'creekside-chatbot-resize') {
      const { width, height } = event.data;
      iframe.style.width = width;
      iframe.style.height = height;
    }
  });
  
  container.appendChild(iframe);
  
  // Inject into page
  function inject() {
    if (document.body) {
      document.body.appendChild(container);
    } else {
      setTimeout(inject, 100);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
