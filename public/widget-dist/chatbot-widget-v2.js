/**
 * Value Build Homes Chatbot Widget v2
 * Self-contained Shadow DOM Web Component - NO IFRAME
 */
(function() {
  'use strict';

  // Prevent double initialization
  if (window.__VBH_WIDGET_INITIALIZED__) {
    console.log('[VBH Widget] Already initialized, skipping');
    return;
  }
  window.__VBH_WIDGET_INITIALIZED__ = true;

  console.log('[VBH Widget v2.1] Shadow DOM Web Component loading...');

  // Configuration
  var SUPABASE_URL = 'https://bhsnjbisxeuguhggjyzv.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoc25qYmlzeGV1Z3VoZ2dqeXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjA2MzYsImV4cCI6MjA3ODY5NjYzNn0.6AvpuIGDo-J08pDV0xrwbrJLNnUbzy6SNZNvfy_FiJw';

  // Widget styles (injected into Shadow DOM)
  var WIDGET_STYLES = `
    :host {
      all: initial;
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #1f2937;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .vbh-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: inherit;
    }

    .vbh-chat-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(30, 58, 95, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .vbh-chat-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 25px rgba(30, 58, 95, 0.5);
    }

    .vbh-chat-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .vbh-chat-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      height: 550px;
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999998;
    }

    .vbh-chat-window.open {
      display: flex;
    }

    @media (max-width: 480px) {
      .vbh-chat-window {
        width: 100%;
        height: 100%;
        max-height: 100%;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
      .vbh-widget-container {
        bottom: 16px;
        right: 16px;
      }
    }

    .vbh-header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .vbh-header-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
    }

    .vbh-header-info h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .vbh-header-info p {
      font-size: 12px;
      opacity: 0.8;
      margin: 0;
    }

    .vbh-close-btn {
      margin-left: auto;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .vbh-close-btn:hover {
      opacity: 1;
    }

    .vbh-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .vbh-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .vbh-message.user {
      align-self: flex-end;
      background: #1e3a5f;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .vbh-message.assistant {
      align-self: flex-start;
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }

    .vbh-typing {
      align-self: flex-start;
      background: #f3f4f6;
      padding: 12px 16px;
      border-radius: 16px;
      display: flex;
      gap: 4px;
    }

    .vbh-typing span {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: vbh-bounce 1.4s infinite ease-in-out;
    }

    .vbh-typing span:nth-child(1) { animation-delay: -0.32s; }
    .vbh-typing span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes vbh-bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    .vbh-input-area {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }

    .vbh-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      font-family: inherit;
    }

    .vbh-input:focus {
      border-color: #1e3a5f;
    }

    .vbh-send-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #1e3a5f;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .vbh-send-btn:hover {
      background: #2d5a87;
    }

    .vbh-send-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .vbh-send-btn svg {
      width: 20px;
      height: 20px;
      fill: white;
    }
  `;

  // Create the Web Component
  class VBHChatbot extends HTMLElement {
    constructor() {
      super();
      this.isOpen = false;
      this.messages = [];
      this.isLoading = false;
    }

    connectedCallback() {
      // Attach Shadow DOM
      this.shadow = this.attachShadow({ mode: 'open' });

      // Inject styles
      var style = document.createElement('style');
      style.textContent = WIDGET_STYLES;
      this.shadow.appendChild(style);

      // Create widget HTML
      this.render();

      // Load saved messages
      this.loadMessages();

      // Bind events
      this.bindEvents();

      console.log('[VBH Widget v2.1] Initialized successfully');
    }

    render() {
      var container = document.createElement('div');
      container.className = 'vbh-widget-container';
      container.innerHTML = `
        <div class="vbh-chat-window" id="chat-window">
          <div class="vbh-header">
            <div class="vbh-header-avatar">S</div>
            <div class="vbh-header-info">
              <h3>Sam</h3>
              <p>Value Build Homes Assistant</p>
            </div>
            <button class="vbh-close-btn" id="close-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="vbh-messages" id="messages">
            <div class="vbh-message assistant">
              Hi! I'm Sam, your Value Build Homes assistant. How can I help you today?
            </div>
          </div>
          <div class="vbh-input-area">
            <input type="text" class="vbh-input" id="input" placeholder="Type your message..." />
            <button class="vbh-send-btn" id="send-btn">
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
        <button class="vbh-chat-button" id="toggle-btn">
          <svg viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        </button>
      `;
      this.shadow.appendChild(container);
    }

    bindEvents() {
      var self = this;
      var toggleBtn = this.shadow.getElementById('toggle-btn');
      var closeBtn = this.shadow.getElementById('close-btn');
      var sendBtn = this.shadow.getElementById('send-btn');
      var input = this.shadow.getElementById('input');

      toggleBtn.addEventListener('click', function() {
        self.toggle();
      });

      closeBtn.addEventListener('click', function() {
        self.close();
      });

      sendBtn.addEventListener('click', function() {
        self.sendMessage();
      });

      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          self.sendMessage();
        }
      });
    }

    toggle() {
      this.isOpen = !this.isOpen;
      var chatWindow = this.shadow.getElementById('chat-window');
      if (this.isOpen) {
        chatWindow.classList.add('open');
        this.shadow.getElementById('input').focus();
      } else {
        chatWindow.classList.remove('open');
      }
    }

    close() {
      this.isOpen = false;
      this.shadow.getElementById('chat-window').classList.remove('open');
    }

    loadMessages() {
      try {
        var saved = localStorage.getItem('vbh-chat-messages');
        if (saved) {
          this.messages = JSON.parse(saved);
          this.renderMessages();
        }
      } catch (e) {
        console.log('[VBH Widget] Could not load saved messages');
      }
    }

    saveMessages() {
      try {
        localStorage.setItem('vbh-chat-messages', JSON.stringify(this.messages));
      } catch (e) {
        console.log('[VBH Widget] Could not save messages');
      }
    }

    renderMessages() {
      var messagesContainer = this.shadow.getElementById('messages');
      var html = '<div class="vbh-message assistant">Hi! I\'m Sam, your Value Build Homes assistant. How can I help you today?</div>';
      
      for (var i = 0; i < this.messages.length; i++) {
        var msg = this.messages[i];
        html += '<div class="vbh-message ' + msg.role + '">' + this.escapeHtml(msg.content) + '</div>';
      }

      messagesContainer.innerHTML = html;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    async sendMessage() {
      var input = this.shadow.getElementById('input');
      var message = input.value.trim();

      if (!message || this.isLoading) return;

      // Add user message
      this.messages.push({ role: 'user', content: message });
      this.renderMessages();
      input.value = '';

      // Show typing indicator
      this.showTyping();
      this.isLoading = true;

      try {
        var response = await fetch(SUPABASE_URL + '/functions/v1/chat-with-sam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ message: message })
        });

        var data = await response.json();
        
        this.hideTyping();
        this.isLoading = false;

        if (data.response) {
          this.messages.push({ role: 'assistant', content: data.response });
        } else if (data.error) {
          this.messages.push({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' });
        }

        this.renderMessages();
        this.saveMessages();

      } catch (error) {
        console.error('[VBH Widget] Error:', error);
        this.hideTyping();
        this.isLoading = false;
        this.messages.push({ role: 'assistant', content: 'Sorry, I couldn\'t connect. Please try again later.' });
        this.renderMessages();
      }
    }

    showTyping() {
      var messagesContainer = this.shadow.getElementById('messages');
      var typing = document.createElement('div');
      typing.className = 'vbh-typing';
      typing.id = 'typing-indicator';
      typing.innerHTML = '<span></span><span></span><span></span>';
      messagesContainer.appendChild(typing);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
      var typing = this.shadow.getElementById('typing-indicator');
      if (typing) typing.remove();
    }
  }

  // Register the custom element
  if (!customElements.get('vbh-chatbot')) {
    customElements.define('vbh-chatbot', VBHChatbot);
  }

  // Auto-inject the widget
  function injectWidget() {
    if (document.querySelector('vbh-chatbot')) return;
    var widget = document.createElement('vbh-chatbot');
    document.body.appendChild(widget);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
  } else {
    injectWidget();
  }

})();
