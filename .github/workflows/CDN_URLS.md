# Widget CDN URLs

## Production URLs

### Value Build Homes Widget (v2 - Web Component)
```
https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget-v2.js
```

### Creekside Homes Widget
```
https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/creekside-chatbot-widget.js
```

## Integration Examples

### VBH Integration (v2 - Recommended)
```html
<script src="https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget-v2.js"></script>
```

### Creekside Integration
```html
<script src="https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/creekside-chatbot-widget.js"></script>
```

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

### Tagged Release
Use Git tags for release management:
```
@v1.0.0/public/widget-dist/chatbot-widget-v2.js
```

## Cache Management

### Purge CDN Cache
```bash
# Purge VBH widget (v2)
curl https://purge.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget-v2.js

# Purge Creekside widget
curl https://purge.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/creekside-chatbot-widget.js
```

### Check File Stats
```bash
# Get file info
curl -I https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/chatbot-widget-v2.js
```

## Deployment Status

Check deployment status:
- GitHub Actions: https://github.com/realestateisa/value-sam-buildbot/actions
- Latest run logs show CDN URLs after successful build

## Notes

- CDN updates automatically on every push to main/master
- Cache is purged automatically by GitHub Actions
- Global availability within seconds of deployment
- No manual upload or deployment steps needed

## Migration from v1 (iframe) to v2 (Web Component)

The v2 widget uses Shadow DOM and mounts directly without an iframe, which eliminates the 404 error from `/widget` route requests.

**Old (v1 - iframe based, deprecated):**
```html
<script src=".../chatbot-widget.js"></script>
```

**New (v2 - web component, recommended):**
```html
<script src=".../chatbot-widget-v2.js"></script>
```
