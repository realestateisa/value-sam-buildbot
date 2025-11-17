import React from "react";
import { createRoot, Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatWidget } from "./components/ChatWidget";
import "./widget.css"; // Import Shadow DOM specific styles

// Placeholder for CSS injection - will be replaced during build
const INJECTED_CSS = "__INJECT_CSS_HERE__";

// Create QueryClient instance for the widget
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

/**
 * Custom Web Component for the Value Build Homes Chatbot
 * Uses Shadow DOM for complete style isolation
 */
class ValueBuildChatbot extends HTMLElement {
  private shadow: ShadowRoot | null = null;
  private root: Root | null = null;
  private container: HTMLDivElement | null = null;
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    // Attach Shadow DOM with open mode
    this.shadow = this.attachShadow({ mode: "open" });

    // Create container for React app
    this.container = document.createElement("div");
    this.container.id = "chatbot-root";
    this.container.style.cssText = "all: initial; display: contents;"; // Reset all styles
    this.shadow.appendChild(this.container);

    // Inject styles into Shadow DOM
    this.injectStyles();

    // Mount React app inside Shadow DOM
    this.mountReactApp();
  }

  disconnectedCallback() {
    // Cleanup when element is removed
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  private injectStyles() {
    if (!this.shadow) return;

    // Create style element
    this.styleElement = document.createElement("style");
    
    // Use the CSS that was inlined during build
    // The build process replaces INJECTED_CSS with actual compiled CSS
    this.styleElement.textContent = INJECTED_CSS;
    this.shadow.appendChild(this.styleElement);
  }

  private mountReactApp() {
    if (!this.container) return;

    // Create root and render React app
    this.root = createRoot(this.container);
    
    this.root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <ChatWidget />
        </QueryClientProvider>
      </React.StrictMode>
    );
  }

  // Allow external configuration via attributes
  static get observedAttributes() {
    return ["territory", "theme"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    
    // Handle attribute changes
    // Can be used for: <vbh-chatbot territory="sydney" theme="dark"></vbh-chatbot>
    console.log(`Attribute ${name} changed from ${oldValue} to ${newValue}`);
    
    // Could trigger re-render with new props if needed
  }
}

// Register the custom element
if (!customElements.get("vbh-chatbot")) {
  customElements.define("vbh-chatbot", ValueBuildChatbot);
}

// Auto-inject mode: automatically create and append the element
// This allows simple script tag inclusion without manual element placement
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
    if (document.querySelector("vbh-chatbot")) {
      return;
    }

    // Create and append the widget
    const widget = document.createElement("vbh-chatbot");
    document.body.appendChild(widget);
  }
})();

// Export for potential programmatic usage
export { ValueBuildChatbot };
