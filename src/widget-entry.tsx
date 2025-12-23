/**
 * VBH Widget v2.0.7 - DISABLED / KILL SWITCH
 * This script removes any existing VBH widget elements and does nothing else.
 * No widget will appear on client sites.
 */
(function() {
  'use strict';
  
  console.log('[VBH Widget] v2.0.7 - Widget disabled, cleaning up any existing elements');
  
  // Remove any existing VBH widget elements from the DOM
  const selectorsToRemove = [
    'vbh-chatbot',
    '#vbh-chatbot',
    '.vbh-chatbot',
    '#widget-container',
    '.vbh-widget-container',
    '[id*="vbh"]',
    '[class*="vbh-widget"]',
    'iframe[src*="widget"]',
    'iframe[src*="vbh"]',
    'iframe[src*="chatbot"]',
  ];
  
  selectorsToRemove.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        console.log('[VBH Widget] Removing element:', el.tagName, el.id || el.className);
        el.remove();
      });
    } catch (e) {
      // Ignore invalid selectors
    }
  });
  
  // Also remove any shadow roots that might contain widget content
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    if (el.shadowRoot) {
      const shadowContent = el.shadowRoot.innerHTML || '';
      if (shadowContent.includes('vbh') || shadowContent.includes('chatbot') || shadowContent.includes('widget')) {
        console.log('[VBH Widget] Removing element with shadow root:', el.tagName);
        el.remove();
      }
    }
  });
  
  console.log('[VBH Widget] Cleanup complete - no widget will be displayed');
})();
