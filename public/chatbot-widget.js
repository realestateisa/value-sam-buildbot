(function() {
  // Create and inject the chatbot widget
  const root = document.getElementById('vbh-chatbot-root');
  if (!root) {
    console.error('vbh-chatbot-root element not found');
    return;
  }

  // Add React and required dependencies
  const addScript = (src, onload) => {
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    if (onload) script.onload = onload;
    document.head.appendChild(script);
  };

  const addStyles = (href) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  // Load React dependencies
  addScript('https://unpkg.com/react@18/umd/react.production.min.js', () => {
    addScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', () => {
      // Inject the chatbot component
      const container = document.createElement('div');
      container.id = 'chatbot-container';
      root.appendChild(container);
      
      // Load the main app bundle
      const appScript = document.createElement('script');
      appScript.type = 'module';
      appScript.src = window.location.origin + '/src/main.tsx';
      document.body.appendChild(appScript);
    });
  });

  // Add Tailwind CSS
  addStyles('https://cdn.jsdelivr.net/npm/tailwindcss@3/dist/tailwind.min.css');
})();
