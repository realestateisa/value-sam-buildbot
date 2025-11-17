# Building the Widget Bundle

## Automated Build (Recommended)

If your project is connected to GitHub, the widget builds automatically on every push via GitHub Actions.

**How it works:**
1. Push code to GitHub (or make changes in Lovable)
2. GitHub Actions workflow triggers automatically
3. Widget builds and commits to `public/widget-dist/chatbot-widget-v2.js`
4. Changes sync back to Lovable via bidirectional sync
5. Click **Publish** in Lovable to deploy

**Setup:**
- Workflow file: `.github/workflows/build-widget.yml` ✅ Already created
- No additional setup needed - works automatically

See `.github/workflows/README.md` for details.

## Phase 1: Build System Setup (Complete)

The following files have been created:
- ✅ `vite.config.widget.ts` - Separate build configuration for widget
- ✅ `src/widget-entry.tsx` - Web Component entry point with Shadow DOM

## Building the Widget

### Automated Build (Recommended - If Using GitHub)
The GitHub Actions workflow automatically builds the widget on every push. Just push your code and the widget is ready!

### Option 1: Manual Build Command
Run this command to build the widget bundle:

```bash
npx vite build --config vite.config.widget.ts
```

This will generate:
- `public/widget-dist/chatbot-widget-v2.js` - The bundled widget script

### Option 2: Add to package.json (Recommended)

Add this to your `package.json` scripts section:

```json
{
  "scripts": {
    "build": "vite build",
    "build:widget": "vite build --config vite.config.widget.ts",
    "build:all": "npm run build && npm run build:widget"
  }
}
```

Then run:
```bash
npm run build:widget
```

## How It Works

### 1. Web Component Architecture
- Custom element: `<vbh-chatbot>`
- Shadow DOM for style isolation
- React app mounted inside Shadow DOM
- Bundled with all dependencies (React, Tailwind, etc.)

### 2. Style Isolation
- All styles are injected into Shadow DOM
- `:root` CSS variables transformed to `:host`
- No style conflicts with host page
- Complete encapsulation

### 3. Integration Methods

#### Auto-Inject Mode (Default)
Just add the script tag - widget appears automatically:
```html
<script src="https://your-domain.com/widget-dist/chatbot-widget-v2.js"></script>
```

#### Manual Placement Mode
Disable auto-inject and place element manually:
```html
<script 
  src="https://your-domain.com/widget-dist/chatbot-widget-v2.js"
  data-auto-inject="false"
></script>

<!-- Place widget wherever you want -->
<vbh-chatbot></vbh-chatbot>
```

#### With Configuration
Pass attributes for customization:
```html
<vbh-chatbot 
  territory="sydney"
  theme="dark"
></vbh-chatbot>
```

## Testing the Build

### Local Testing
1. Build the widget: `npm run build:widget`
2. Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>Test Page for Chatbot Widget</h1>
  <p>The chatbot should appear in the bottom right corner.</p>
  
  <!-- Load the widget -->
  <script src="./widget-dist/chatbot-widget-v2.js"></script>
</body>
</html>
```

3. Serve with a local server:
```bash
npx serve public
```

4. Open in browser and test:
   - ✅ Chatbot appears in bottom right
   - ✅ No style conflicts with page
   - ✅ Speech bubble visible (no clipping)
   - ✅ Hover effects work properly
   - ✅ Chat opens/closes smoothly

## Next Steps

### Phase 2: Component Refactoring
Now that the build system is set up, we need to:

1. **Remove iframe-specific logic from ChatWidget.tsx**
   - Remove postMessage resize logic
   - Remove window.parent communication
   - Simplify positioning to use pure CSS

2. **Fix CSS for Shadow DOM**
   - Ensure all Tailwind classes work
   - Test dark mode
   - Verify responsive behavior

3. **Handle Third-Party Scripts**
   - Test Cal.com integration
   - Decide on iframe vs. Portal approach for calendar

4. **Add Configuration Support**
   - Read attributes from custom element
   - Pass configuration to React components
   - Support territory, theme, etc.

### Commands Reference

```bash
# Build main app
npm run build

# Build widget only
npm run build:widget

# Build both
npm run build:all

# Development (main app)
npm run dev

# Development (widget) - not set up yet
# Would need separate dev server for widget testing
```

## Troubleshooting

### Issue: Styles not working in Shadow DOM
**Solution**: Make sure all CSS variables use `:host` instead of `:root`

### Issue: React not rendering
**Solution**: Check console for errors, ensure all dependencies are bundled

### Issue: Cal.com not working
**Solution**: May need iframe specifically for Cal.com modal (Phase 2)

### Issue: Large bundle size
**Solution**: Currently bundles React + deps. In production, consider code splitting or CDN for React

## File Structure

```
project/
├── vite.config.ts              # Main app build config
├── vite.config.widget.ts       # Widget build config (NEW)
├── src/
│   ├── widget-entry.tsx        # Widget entry point (NEW)
│   ├── components/
│   │   └── ChatWidget.tsx      # Will refactor in Phase 2
│   └── index.css               # Styles injected into Shadow DOM
├── public/
│   ├── chatbot-widget.js       # v1 iframe (deprecated)
│   └── widget-dist/            # NEW: v2 build output
│       └── chatbot-widget-v2.js
```

## Production Deployment

When deploying:
1. Run `npm run build:all`
2. Upload `public/widget-dist/chatbot-widget-v2.js` to your CDN/server
3. Update client integration URLs
4. Test on staging site first
5. Gradual rollout to production clients

## Support for Old Browsers

Shadow DOM support:
- ✅ Chrome 53+
- ✅ Firefox 63+
- ✅ Safari 10+
- ✅ Edge 79+
- ❌ IE11 (not supported)

Coverage: ~96% of browsers globally

For IE11 support (if needed):
- Consider polyfill: `@webcomponents/webcomponentsjs`
- Or provide fallback message
- Or keep iframe version for legacy browsers
