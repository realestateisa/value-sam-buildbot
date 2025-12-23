/**
 * VBH Widget v2.1.2 - Shadow DOM Implementation
 * This script creates a shadow DOM widget for the VBH chatbot.
 * NO IFRAMES - pure Shadow DOM encapsulation.
 * Rebuilt to replace kill-switch with working widget.
 * Deployed via Lovable hosting to vbh-chat-bot.com
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatWidget } from './components/ChatWidget';
import widgetStyles from './widget.css?inline';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Define the VBH Chatbot custom element
class VBHChatbot extends HTMLElement {
  private root: ReturnType<typeof createRoot> | null = null;
  private container: HTMLDivElement | null = null;

  connectedCallback() {
    console.log('[VBH Widget] v2.1.2 - Initializing Shadow DOM widget');
    
    // Create shadow root for style isolation
    const shadow = this.attachShadow({ mode: 'open' });
    
    // Inject styles into shadow DOM
    const styleElement = document.createElement('style');
    styleElement.textContent = widgetStyles;
    shadow.appendChild(styleElement);
    
    // Create container for React app
    this.container = document.createElement('div');
    this.container.id = 'vbh-widget-root';
    this.container.style.cssText = 'position: fixed; bottom: 0; right: 0; z-index: 2147483647; font-family: system-ui, -apple-system, sans-serif;';
    shadow.appendChild(this.container);
    
    // Mount React app
    this.root = createRoot(this.container);
    this.root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <ChatWidget />
        </QueryClientProvider>
      </React.StrictMode>
    );
    
    console.log('[VBH Widget] Shadow DOM widget mounted successfully');
  }

  disconnectedCallback() {
    console.log('[VBH Widget] Cleaning up widget');
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

// Register custom element if not already registered
if (!customElements.get('vbh-chatbot')) {
  customElements.define('vbh-chatbot', VBHChatbot);
  console.log('[VBH Widget] Custom element registered');
}

// Auto-inject the widget into the page
function injectWidget() {
  // Don't inject if already present
  if (document.querySelector('vbh-chatbot')) {
    console.log('[VBH Widget] Widget already exists, skipping injection');
    return;
  }
  
  const widget = document.createElement('vbh-chatbot');
  document.body.appendChild(widget);
  console.log('[VBH Widget] Widget injected into page');
}

// Inject when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectWidget);
} else {
  injectWidget();
}
