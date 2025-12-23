/**
 * VBH Widget v2.2.0 - Shadow DOM Implementation
 * Rebuilt to match the working Creekside pattern exactly.
 * NO IFRAMES - pure Shadow DOM encapsulation.
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatWidget } from './components/ChatWidget';
import { Toaster } from './components/ui/toaster';
import widgetStyles from './widget.css?inline';

// Create QueryClient with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Define VBH Chatbot custom element
class VBHChatbot extends HTMLElement {
  private shadow: ShadowRoot | null = null;
  private root: Root | null = null;
  private container: HTMLDivElement | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    console.log('[VBH Widget] v2.2.0 - Initializing Shadow DOM widget');
    
    // No positioning on host element - Shadow DOM CSS handles it
    this.style.cssText = '';
    
    // Attach Shadow DOM for style isolation
    this.shadow = this.attachShadow({ mode: 'open' });
    
    // Create container with ID matching CSS selectors
    this.container = document.createElement('div');
    this.container.id = 'vbh-widget-root';
    this.container.style.cssText = '';
    this.shadow.appendChild(this.container);
    
    // Inject styles and mount React
    this.injectStyles();
    this.mountReactApp();
    
    console.log('[VBH Widget] Shadow DOM widget mounted successfully');
  }

  disconnectedCallback() {
    console.log('[VBH Widget] Cleaning up widget');
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
          <ChatWidget />
          <Toaster />
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

// Register custom element if not already registered
if (!customElements.get('vbh-chatbot')) {
  customElements.define('vbh-chatbot', VBHChatbot);
  console.log('[VBH Widget] Custom element registered');
}

// Auto-inject widget into page
(function autoInject() {
  const currentScript = document.currentScript as HTMLScriptElement;
  const autoInject = currentScript?.getAttribute('data-auto-inject') !== 'false';

  if (autoInject) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectWidget);
    } else {
      injectWidget();
    }
  }

  function injectWidget() {
    if (document.querySelector('vbh-chatbot')) {
      console.log('[VBH Widget] Widget already exists, skipping injection');
      return;
    }
    const widget = document.createElement('vbh-chatbot');
    document.body.appendChild(widget);
    console.log('[VBH Widget] Widget injected into page');
  }
})();

export { VBHChatbot };
