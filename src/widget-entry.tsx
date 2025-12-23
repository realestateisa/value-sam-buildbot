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

    // Defensive host styles (override any legacy site CSS that hid the widget)
    this.style.setProperty('display', 'block', 'important');
    this.style.setProperty('visibility', 'visible', 'important');
    this.style.setProperty('opacity', '1', 'important');
    this.style.setProperty('pointer-events', 'auto', 'important');
    this.style.setProperty('position', 'fixed', 'important');
    this.style.setProperty('inset', 'auto', 'important');
    this.style.setProperty('right', '0', 'important');
    this.style.setProperty('bottom', '0', 'important');
    this.style.setProperty('z-index', '2147483647', 'important');

    // Attach Shadow DOM for style isolation
    this.shadow = this.attachShadow({ mode: 'open' });

    // Create container with ID matching CSS selectors
    this.container = document.createElement('div');
    this.container.id = 'vbh-widget-root';
    this.container.style.cssText = '';
    this.shadow.appendChild(this.container);

    // Always-visible fallback launcher (so something shows even if React button is hidden by site CSS)
    const fallback = document.createElement('button');
    fallback.id = 'vbh-widget-fallback-launcher';
    fallback.type = 'button';
    fallback.textContent = 'Chat';
    fallback.setAttribute('aria-label', 'Open chat');
    fallback.style.cssText = [
      'position:fixed',
      'right:24px',
      'bottom:24px',
      'width:72px',
      'height:72px',
      'border-radius:9999px',
      'border:0',
      'cursor:pointer',
      'background:#E93424',
      'color:#fff',
      'font:600 14px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      'box-shadow:0 16px 40px rgba(0,0,0,.25)',
      'z-index:2147483647',
      'pointer-events:auto',
    ].join(';');
    fallback.addEventListener('click', () => {
      const w = window as any;
      if (typeof w.__VBH_WIDGET_TOGGLE__ === 'function') w.__VBH_WIDGET_TOGGLE__();
    });
    this.shadow.appendChild(fallback);

    // Inject styles and mount React
    this.injectStyles();
    this.mountReactApp();

    // Diagnostics: prove the host is visible and has size
    try {
      const cs = window.getComputedStyle(this);
      const rect = this.getBoundingClientRect();
      console.log('[VBH Widget] Host computed styles', {
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
        position: cs.position,
        zIndex: cs.zIndex,
        rect,
      });
    } catch (e) {
      console.warn('[VBH Widget] Diagnostics failed', e);
    }

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

    // Hide fallback launcher once React exposes the global toggle
    window.setTimeout(() => {
      try {
        const w = window as any;
        const fallback = this.shadow?.getElementById('vbh-widget-fallback-launcher') as HTMLElement | null;
        if (fallback && typeof w.__VBH_WIDGET_TOGGLE__ === 'function') {
          fallback.style.display = 'none';
        }
      } catch {
        // ignore
      }
    }, 250);
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
