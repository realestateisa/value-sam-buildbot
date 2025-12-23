(function () {
  // Loader for the real Shadow DOM widget bundle
  const scriptSrc =
    document.currentScript?.src ||
    document.querySelector('script[src*="chatbot-widget.js"]')?.src;

  const origin = scriptSrc ? new URL(scriptSrc).origin : window.location.origin;

  // Avoid double-inject
  if (document.querySelector('script[data-vbh-widget-bundle="true"]')) return;

  const widgetScript = document.createElement('script');
  widgetScript.src = origin + '/widget-dist/chatbot-widget.js';
  widgetScript.async = true;
  widgetScript.defer = true;
  widgetScript.dataset.vbhWidgetBundle = 'true';

  document.head.appendChild(widgetScript);
})();
