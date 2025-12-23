# Widget CDN URLs (v2.4.0)

## Production URLs

### Value Build Homes Widget v2 (Recommended)
```
https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget-v2.js
```

### Value Build Homes Widget (Canonical)
```
https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget.js
```

### Creekside Homes Widget
```
https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/creekside-chatbot-widget.js
```

## Integration Examples

### VBH Integration (v2 - Recommended)
```html
<script src="https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget-v2.js?v=2.4.0"></script>
```

### VBH Integration (Canonical)
```html
<script src="https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget.js?v=2.4.0"></script>
```

### Creekside Integration
```html
<script src="https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/creekside-chatbot-widget.js"></script>
```

## Cache Busting

Add a version query parameter to force cache refresh:
```html
<script src="...chatbot-widget-v2.js?v=2.4.0"></script>
```

## Verification

After loading, check the browser console for:
- `[VBH Widget] v2.4.0` - Confirms correct version loaded
- `Logo src type: INLINED` - Confirms logo is embedded as base64 (will work on external sites)
- `Logo src type: EXTERNAL` - Logo uses URL (may fail on external sites due to CORS)

## Version Pinning

### Latest (Main Branch)
Always serves the latest committed version:
```
@main/public/widget-dist/chatbot-widget-v2.js
```

### Specific Commit
Pin to a specific commit hash for stability:
```
@abc123def/public/widget-dist/chatbot-widget-v2.js
```

## Cache Management

### Purge CDN Cache
```bash
# Purge VBH widget v2
curl https://purge.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget-v2.js

# Purge VBH widget canonical
curl https://purge.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget.js

# Purge Creekside widget
curl https://purge.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/creekside-chatbot-widget.js
```

## Deployment Status

Check deployment status:
- GitHub Actions: Check repo Actions tab
- Latest run logs show CDN URLs after successful build

## Notes

- CDN updates automatically on every push to main/master
- Cache is purged automatically by GitHub Actions
- Global availability within seconds of deployment
- No manual upload or deployment steps needed
- Logo is inlined as base64 in the widget bundle for cross-origin compatibility
