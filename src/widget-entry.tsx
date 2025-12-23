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

    // Make the host element itself un-hideable by hostile site CSS
    // (If the site has a rule like `vbh-chatbot { display:none }`, this forces visibility.)
    this.style.cssText = [
      'all: initial',
      'display: block',
      'position: fixed',
      'bottom: 0',
      'right: 0',
      'z-index: 2147483647',
      'pointer-events: auto',
    ].join('; ');

    // Create shadow root for style isolation
    const shadow = this.attachShadow({ mode: 'open' });

    // Inject styles into shadow DOM
    const styleElement = document.createElement('style');
    styleElement.textContent = widgetStyles;
    shadow.appendChild(styleElement);

    // Create container for React app
    this.container = document.createElement('div');
    this.container.id = 'vbh-widget-root';
    // Keep container unpositioned; the React widget handles its own fixed positioning
    this.container.style.cssText = 'position: relative; z-index: 2147483647;';
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
  try {
    // Don't inject if already present
    if (document.querySelector('vbh-chatbot')) {
      console.log('[VBH Widget] Widget already exists, skipping injection');
      return;
    }

    const widget = document.createElement('vbh-chatbot');
    
    // Inject into documentElement (html) to escape body containment issues
    // This avoids transforms/overflow:hidden on body that break fixed positioning
    const target = document.documentElement || document.body;
    target.appendChild(widget);
    console.log('[VBH Widget] Widget injected into', target.tagName);
    
    // Post-mount diagnostics
    requestAnimationFrame(() => {
      const host = document.querySelector('vbh-chatbot');
      if (host) {
        const rect = host.getBoundingClientRect();
        const styles = window.getComputedStyle(host);
        console.log('[VBH Widget] Host diagnostics:', {
          connected: host.isConnected,
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position
        });
      }
    });
  } catch (err) {
    console.error('[VBH Widget] Inject failed', err);
  }
}

function ensureInjected() {
  // Inject immediately
  injectWidget();

  // Re-inject if another script removes the element (common on hostile pages / legacy loaders)
  try {
    const observer = new MutationObserver(() => {
      if (!document.querySelector('vbh-chatbot')) {
        injectWidget();
      }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  } catch (err) {
    console.error('[VBH Widget] Observer failed', err);
  }
}

// Inject when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ensureInjected);
} else {
  ensureInjected();
}

