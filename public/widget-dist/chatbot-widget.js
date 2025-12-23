(function () {
  // Root loader that always pulls the canonical widget script from /widget-dist.
  const scriptSrc =
    document.currentScript?.src ||
    document.querySelector('script[src*="chatbot-widget.js"]')?.src;

  const origin = scriptSrc ? new URL(scriptSrc).origin : window.location.origin;

  if (document.querySelector('script[data-vbh-widget="true"]')) return;

  const widgetScript = document.createElement('script');
  widgetScript.src = origin + '/widget-dist/chatbot-widget.js';
  widgetScript.async = true;
  widgetScript.defer = true;
  widgetScript.dataset.vbhWidget = 'true';

  document.head.appendChild(widgetScript);
})();
