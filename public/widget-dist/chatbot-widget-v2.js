/**
 * Value Build Homes Chatbot Widget v2
 * Self-contained widget loader - creates iframe pointing to vbh-chat-bot.com
 */
(function() {
  'use strict';

  // Prevent double initialization
  if (window.__VBH_WIDGET_INITIALIZED__) {
    console.log('[VBH Widget] Already initialized, skipping');
    return;
  }
  window.__VBH_WIDGET_INITIALIZED__ = true;

  console.log('[VBH Widget v2] Initializing...');

  // Configuration
  var WIDGET_HOST = 'https://vbh-chat-bot.com';
  var WIDGET_PATH = '/widget';

  // Create and inject styles
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '#vbh-chat-widget-container {',
      '  position: fixed;',
      '  bottom: 0;',
      '  right: 0;',
      '  z-index: 999999;',
      '  width: 100px;',
      '  height: 100px;',
      '  border: none;',
      '  background: transparent;',
      '  pointer-events: none;',
      '}',
      '#vbh-chat-widget-container.vbh-expanded {',
      '  width: 420px;',
      '  height: 650px;',
      '  max-width: 100vw;',
      '  max-height: 100vh;',
      '}',
      '#vbh-chat-widget-iframe {',
      '  width: 100%;',
      '  height: 100%;',
      '  border: none;',
      '  background: transparent;',
      '  pointer-events: auto;',
      '}',
      '@media (max-width: 480px) {',
      '  #vbh-chat-widget-container.vbh-expanded {',
      '    width: 100vw;',
      '    height: 100vh;',
      '    bottom: 0;',
      '    right: 0;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // Create widget container and iframe
  function createWidget() {
    // Create container
    var container = document.createElement('div');
    container.id = 'vbh-chat-widget-container';

    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.id = 'vbh-chat-widget-iframe';
    iframe.src = WIDGET_HOST + WIDGET_PATH;
    iframe.title = 'Chat with Sam';
    iframe.setAttribute('loading', 'lazy');
    iframe.allow = 'microphone';

    container.appendChild(iframe);
    document.body.appendChild(container);

    console.log('[VBH Widget v2] Widget iframe created, src:', iframe.src);

    return { container: container, iframe: iframe };
  }

  // Handle messages from iframe
  function setupMessageListener(container) {
    window.addEventListener('message', function(event) {
      // Verify origin
      if (event.origin !== WIDGET_HOST) return;

      var data = event.data;
      if (!data || typeof data !== 'object') return;

      // Handle resize messages
      if (data.type === 'vbh-widget-resize') {
        if (data.expanded) {
          container.classList.add('vbh-expanded');
        } else {
          container.classList.remove('vbh-expanded');
        }
        console.log('[VBH Widget v2] Resize:', data.expanded ? 'expanded' : 'collapsed');
      }
    });
  }

  // Initialize when DOM is ready
  function init() {
    if (document.body) {
      injectStyles();
      var widget = createWidget();
      setupMessageListener(widget.container);
      console.log('[VBH Widget v2] Initialized successfully');
    } else {
      document.addEventListener('DOMContentLoaded', init);
    }
  }

  init();
})();
