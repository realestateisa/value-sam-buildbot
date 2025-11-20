import React from 'react';
import { createRoot, Root } from 'react-dom/client';
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
  private shadow: ShadowRoot | null = null;
  private root: Root | null = null;
  private container: HTMLDivElement | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    // No positioning on host - let Shadow DOM CSS handle it like VBH
    this.style.cssText = '';
    
    // Attach Shadow DOM
    this.shadow = this.attachShadow({ mode: 'open' });
    
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'creekside-chatbot-root';
    this.container.style.cssText = '';
    this.shadow.appendChild(this.container);
    
    // Inject styles and mount
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
    if (!this.shadow) return;
    
    const style = document.createElement('style');
    style.textContent = widgetStyles;
    this.shadow.appendChild(style);
  }

  private mountReactApp() {
    if (!this.container) return;
    
    this.root = createRoot(this.container);
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

// Auto-inject mode: automatically create and append the element
(function autoInject() {
  // Check if auto-inject is disabled via script attribute
  const currentScript = document.currentScript as HTMLScriptElement;
  const autoInject = currentScript?.getAttribute("data-auto-inject") !== "false";

  if (autoInject) {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", injectWidget);
    } else {
      injectWidget();
    }
  }

  function injectWidget() {
    // Check if element already exists
    if (document.querySelector("creekside-chatbot")) {
      return;
    }

    // Create and append the widget
    const widget = document.createElement("creekside-chatbot");
    document.body.appendChild(widget);
  }
})();

export { CreeksideChatbot };
