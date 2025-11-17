# Migration Plan: Iframe → Shadow DOM Web Component

## Executive Summary
Migrate the chatbot from iframe-based embedding to Shadow DOM with Web Components to eliminate clipping/boundary issues while maintaining complete style isolation.

## Current Architecture Problems
- ❌ Iframe creates hard boundaries (clipping speech bubble)
- ❌ Complex sizing calculations with postMessage
- ❌ Overflow issues with hover effects
- ❌ Performance overhead from separate document context
- ❌ Positioning complexity (fixed dimensions)

## Target Architecture Benefits
- ✅ No clipping - elements can overflow naturally
- ✅ Native DOM - better performance
- ✅ Style isolation via Shadow DOM
- ✅ Simpler positioning (CSS only)
- ✅ Better animations (native transform support)
- ✅ Single document context

---

## Phase 1: Build System Setup

### 1.1 Create Separate Build Configuration
**Goal**: Bundle chatbot as standalone script

**Tasks**:
- [ ] Create `vite.config.widget.ts` for widget build
- [ ] Configure library mode with no code splitting
- [ ] Inline all CSS into the bundle
- [ ] Bundle React + dependencies together
- [ ] Output: Single `chatbot-widget-v2.js` file

**Technical Details**:
```typescript
// vite.config.widget.ts
export default defineConfig({
  build: {
    lib: {
      entry: 'src/widget-entry.tsx',
      formats: ['iife'],
      name: 'ValueBuildChatbot',
      fileName: () => 'chatbot-widget-v2.js'
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      }
    }
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer]
    }
  }
})
```

---

## Phase 2: Web Component Implementation

### 2.1 Create Custom Element Wrapper
**Goal**: Define `<vbh-chatbot>` custom element

**Tasks**:
- [ ] Create `src/widget-entry.tsx` as entry point
- [ ] Define custom element class `ValueBuildChatbot`
- [ ] Attach Shadow DOM in `connectedCallback()`
- [ ] Create root element for React inside Shadow DOM
- [ ] Register custom element

**Technical Details**:
```typescript
// src/widget-entry.tsx
class ValueBuildChatbot extends HTMLElement {
  private shadow: ShadowRoot;
  private root: Root;

  connectedCallback() {
    // Attach Shadow DOM
    this.shadow = this.attachShadow({ mode: 'open' });
    
    // Create container for React
    const container = document.createElement('div');
    container.id = 'chatbot-root';
    this.shadow.appendChild(container);
    
    // Inject styles into Shadow DOM
    const styleSheet = document.createElement('style');
    styleSheet.textContent = BUNDLED_STYLES; // From build
    this.shadow.appendChild(styleSheet);
    
    // Mount React app
    this.root = createRoot(container);
    this.root.render(<ChatWidget isEmbedded={true} />);
  }

  disconnectedCallback() {
    this.root?.unmount();
  }
}

customElements.define('vbh-chatbot', ValueBuildChatbot);
```

---

## Phase 3: Style Isolation Strategy

### 3.1 Tailwind in Shadow DOM
**Goal**: Make Tailwind work within Shadow DOM boundaries

**Challenges**:
- Tailwind uses `:root` for CSS variables
- Shadow DOM has separate style scope

**Solutions**:
- [ ] Replace `:root` with `:host` in generated CSS
- [ ] Include all Tailwind base styles in bundle
- [ ] Use PostCSS plugin to transform selectors
- [ ] Define CSS custom properties on `:host`

**Technical Details**:
```css
/* Before (normal Tailwind) */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

/* After (Shadow DOM compatible) */
:host {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

/* All styles scoped to Shadow DOM automatically */
:host .bg-background {
  background-color: hsl(var(--background));
}
```

### 3.2 Font Loading
**Goal**: Load custom fonts inside Shadow DOM

**Tasks**:
- [ ] Move `@font-face` declarations into Shadow DOM styles
- [ ] Use data URIs or external URLs for fonts
- [ ] Test font loading performance
- [ ] Add fallback fonts

---

## Phase 4: Component Refactoring

### 4.1 Remove Iframe-Specific Code
**Goal**: Simplify ChatWidget for direct DOM mounting

**Tasks**:
- [ ] Remove `postMessage` resize logic (lines 59-75 in ChatWidget.tsx)
- [ ] Remove `isEmbedded` conditional sizing
- [ ] Use CSS `position: fixed` directly
- [ ] Remove window.parent message listeners
- [ ] Simplify state management

**Before (Iframe)**:
```typescript
// Complex resize calculation
useEffect(() => {
  if (isEmbedded) {
    const totalHeight = isOpen ? (chatHeight + gap + buttonHeight) : buttonHeight;
    window.parent.postMessage({ type: 'chatbot-resize', width, height }, '*');
  }
}, [isOpen, showCalendar]);
```

**After (Shadow DOM)**:
```typescript
// Just use CSS
<div className="fixed bottom-6 right-6">
  {/* Everything positioned naturally with CSS */}
</div>
```

### 4.2 Third-Party Script Integration
**Goal**: Handle Cal.com and other external scripts

**Challenges**:
- Cal.com scripts may not work in Shadow DOM
- Need to inject scripts carefully

**Solutions**:
- [ ] Test Cal.com in Shadow DOM environment
- [ ] Potentially use iframe only for Cal.com embed
- [ ] Or inject Cal.com script into main document
- [ ] Use Portal pattern if needed

---

## Phase 5: Distribution & Integration

### 5.1 Client Integration (Simple)
**Goal**: Make it trivial for clients to add chatbot

**New Integration**:
```html
<!-- Option 1: Auto-inject -->
<script src="https://your-domain.com/chatbot-widget-v2.js"></script>

<!-- Option 2: Manual placement -->
<script src="https://your-domain.com/chatbot-widget-v2.js"></script>
<vbh-chatbot></vbh-chatbot>
```

**Tasks**:
- [ ] Create auto-injection mode (appends element automatically)
- [ ] Create manual mode (requires `<vbh-chatbot>` tag)
- [ ] Add configuration via attributes: `<vbh-chatbot territory="sydney"></vbh-chatbot>`
- [ ] Document integration for clients

### 5.2 Hosting Strategy
**Tasks**:
- [ ] Build widget bundle on deployment
- [ ] Host at `/chatbot-widget-v2.js` endpoint
- [ ] Add cache headers for performance
- [ ] Set up CDN if needed
- [ ] Version the script for updates

---

## Phase 6: Testing Strategy

### 6.1 Development Testing
- [ ] Test in local dev environment
- [ ] Test style isolation (no conflicts with host styles)
- [ ] Test z-index behavior
- [ ] Test animations (hover, transitions)
- [ ] Test speech bubble overflow
- [ ] Test responsive behavior

### 6.2 Client Site Testing
- [ ] Test on various client websites
- [ ] Test with different CSS frameworks on host
- [ ] Test mobile responsiveness
- [ ] Test accessibility
- [ ] Test performance vs iframe version

### 6.3 Edge Cases
- [ ] Multiple chatbots on same page
- [ ] CSP (Content Security Policy) restrictions
- [ ] Older browsers (Shadow DOM support)
- [ ] High z-index conflicts
- [ ] Dark mode compatibility

---

## Phase 7: Migration Execution

### 7.1 Parallel Implementation
**Week 1-2**: Build system + Web Component
- Set up new build config
- Create basic Web Component
- Get React rendering in Shadow DOM

**Week 2-3**: Style isolation
- Move Tailwind into Shadow DOM
- Fix CSS custom properties
- Test visual parity with iframe version

**Week 3-4**: Component refactoring
- Remove iframe logic
- Simplify positioning
- Test functionality

### 7.2 Gradual Rollout
- [ ] Release v2 alongside v1 (iframe)
- [ ] Test with 1-2 pilot client sites
- [ ] Gather feedback
- [ ] Fix issues
- [ ] Document migration guide for existing clients

### 7.3 Deprecation of Iframe Version
- [ ] Send migration notice to clients
- [ ] Provide 2-3 month transition period
- [ ] Update docs to show v2 by default
- [ ] Mark v1 as deprecated
- [ ] Remove v1 after transition period

---

## Technical Challenges & Solutions

### Challenge 1: CSS Custom Properties in Shadow DOM
**Problem**: Tailwind's CSS variables defined on `:root` won't pierce Shadow DOM

**Solution**: 
- Transform `:root` to `:host` in build
- Re-define all custom properties in Shadow DOM
- Use PostCSS plugin for automatic transformation

### Challenge 2: Third-Party Scripts (Cal.com)
**Problem**: Cal.com might not work inside Shadow DOM

**Solution**:
- Test in Shadow DOM first
- If issues: Create iframe specifically for Cal.com modal
- Use modal overlay that breaks out of Shadow DOM if needed
- Or inject Cal.com into main document with Portal pattern

### Challenge 3: Font Loading
**Problem**: `@font-face` in Shadow DOM may require different paths

**Solution**:
- Use absolute URLs for font files
- Or inline fonts as data URIs
- Test loading performance
- Add font-display: swap for better UX

### Challenge 4: Browser Compatibility
**Problem**: Shadow DOM not supported in very old browsers

**Solution**:
- Check caniuse.com (Shadow DOM is 96%+ supported)
- Provide fallback message for unsupported browsers
- Or polyfill if necessary (adds complexity)
- Document minimum browser requirements

---

## Success Metrics

### Before (Iframe)
- Complex sizing: 50+ lines of resize logic
- Clipping issues: Speech bubble cut off
- Performance: Separate document context overhead

### After (Shadow DOM)
- Simple positioning: Pure CSS, ~10 lines
- No clipping: Natural overflow works
- Performance: Same document context, faster
- Developer experience: Easier to maintain

---

## Rollback Plan

If major issues arise:
1. Keep iframe version (`chatbot-widget.js`) available
2. Clients can switch back by changing script URL
3. Fix issues in v2 without affecting v1 users
4. Re-test and re-release v2

---

## File Structure (New)

```
public/
  chatbot-widget.js           # v1 (iframe) - deprecated
  chatbot-widget-v2.js        # v2 (Shadow DOM) - built output

src/
  widget-entry.tsx            # NEW: Web Component entry point
  components/
    ChatWidget.tsx            # Refactored (remove iframe logic)
    ChatWidgetSimple.tsx      # NEW: Simplified for Shadow DOM
  
vite.config.ts                # Existing (main app)
vite.config.widget.ts         # NEW: Widget build config
```

---

## Next Steps

1. **Approve this plan** - Review and confirm approach
2. **Set up development branch** - `feat/shadow-dom-migration`
3. **Start Phase 1** - Build system configuration
4. **Iterative development** - Test each phase before moving to next
5. **Beta testing** - Test with pilot clients
6. **Production release** - Gradual rollout

---

## Questions to Address

- [ ] Do we need to support IE11? (Affects Shadow DOM support)
- [ ] What's the timeline for migration? (Suggested: 4-6 weeks)
- [ ] Can we test on real client sites during development?
- [ ] Should we maintain both versions long-term or deprecate iframe?
- [ ] Any CSP restrictions we need to handle?

---

## Estimated Timeline

**Total: 4-6 weeks**
- Week 1: Build system + basic Web Component
- Week 2: Style isolation + visual parity
- Week 3: Component refactoring + testing
- Week 4: Client testing + fixes
- Week 5-6: Gradual rollout + support

This timeline assumes:
- No major blockers with third-party scripts
- Shadow DOM works as expected
- Minimal client-side compatibility issues
