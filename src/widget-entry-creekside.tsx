import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatWidgetCreekside } from './components/ChatWidgetCreekside';
import widgetStyles from './widget-creekside.css?inline';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Define the custom element class
class CreeksideChatbot extends HTMLElement {
  private root: ReactDOM.Root | null = null;
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.injectStyles();
    this.mountReactApp();
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  private injectStyles() {
    const style = document.createElement('style');
    style.textContent = widgetStyles;
    this.shadow.appendChild(style);
  }

  private mountReactApp() {
    const container = document.createElement('div');
    container.id = 'creekside-chatbot-root';
    this.shadow.appendChild(container);

    this.root = ReactDOM.createRoot(container);
    this.root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <ChatWidgetCreekside />
        </QueryClientProvider>
      </React.StrictMode>
    );
  }

  static get observedAttributes() {
    return ['territory', 'theme'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.mountReactApp();
    }
  }
}

// Register the custom element
if (!customElements.get('creekside-chatbot')) {
  customElements.define('creekside-chatbot', CreeksideChatbot);
}

// Auto-inject the widget if not explicitly disabled
(() => {
  const autoInject = !document.querySelector('creekside-chatbot[no-auto-inject]');
  
  if (autoInject) {
    const init = () => {
      if (!document.querySelector('creekside-chatbot')) {
        const widget = document.createElement('creekside-chatbot');
        document.body.appendChild(widget);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();

export { CreeksideChatbot };
