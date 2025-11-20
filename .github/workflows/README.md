# GitHub Actions Workflows

## Build Widget Workflow

**File:** `build-widget.yml`

### Purpose
Automatically builds and deploys both VBH and Creekside chatbot widgets to jsDelivr CDN whenever code is pushed to the repository.

### Triggers
- **Push to main/master branch**: Builds widgets and deploys to CDN
- **Pull requests**: Builds widgets to verify compilation (no CDN deployment)
- **Manual dispatch**: Can be triggered manually from GitHub Actions tab

### What It Does
1. **Checkout** - Clones the repository code
2. **Setup** - Configures Node.js 20 environment
3. **Install** - Installs dependencies with `npm ci`
4. **Build VBH Widget** - Runs `BUILD_TARGET=widget npx vite build`
5. **Build Creekside Widget** - Runs `npx vite build --config vite.config.creekside.ts`
6. **Check Changes** - Detects if widget files changed
7. **Commit** - Commits built widgets back to repository
8. **Push** - Pushes changes to same branch
9. **Purge CDN Cache** - Clears jsDelivr cache for immediate updates
10. **Display URLs** - Shows CDN URLs in workflow summary

### Output Files
- `public/widget-dist/chatbot-widget.js` (VBH)
- `public/widget-dist/creekside-chatbot-widget.js` (Creekside)
- Commit message: `chore: auto-build widget [skip ci]`
- The `[skip ci]` tag prevents infinite build loops

### CDN URLs
After successful build, widgets are available globally via:
- **VBH**: `https://cdn.jsdelivr.net/gh/{repo}@{branch}/public/widget-dist/chatbot-widget.js`
- **Creekside**: `https://cdn.jsdelivr.net/gh/{repo}@{branch}/public/widget-dist/creekside-chatbot-widget.js`

CDN cache is automatically purged for immediate availability.

### Benefits
- ✅ **Zero-Config Deployment** - No manual build or upload steps
- ✅ **Global CDN** - Widgets served from 100+ countries via jsDelivr
- ✅ **Auto-Updates** - Widgets always match latest code
- ✅ **Cache Management** - Automatic CDN cache purging
- ✅ **Instant Availability** - Updates live within seconds
- ✅ **Bidirectional Sync** - Changes sync to Lovable automatically
- ✅ **PR Validation** - Builds verify before merging
- ✅ **Deployment History** - Full audit trail in Actions logs

### Viewing Deployment Results

After each successful deployment:
1. Go to **Actions** tab in GitHub
2. Click on latest "Build Widget" run
3. View **Summary** section for:
   - Build status
   - CDN URLs for both widgets
   - Deployment confirmation

### Manual Trigger
To manually trigger the workflow:
1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Build Widget** workflow
4. Click **Run workflow** button
5. Select branch and click **Run workflow**

### Local Development
For local testing, you can build manually:
```bash
# Build VBH widget
BUILD_TARGET=widget npx vite build

# Build Creekside widget
npx vite build --config vite.config.creekside.ts
```

### Troubleshooting

**Widgets not building?**
- Check the **Actions** tab for error logs
- Verify build config files exist: `vite.config.widget.ts`, `vite.config.creekside.ts`
- Ensure all dependencies are correctly specified in `package.json`
- Check for TypeScript or linting errors

**CDN not updating?**
- Wait 2-3 minutes for workflow to complete
- Check workflow logs confirm cache purge step ran
- Clear browser cache (Ctrl+Shift+R)
- Verify using: `curl -I {cdn-url}`

**Changes not syncing to Lovable?**
- GitHub's bidirectional sync should happen automatically
- Check commits appear in GitHub repository
- Widget files should sync to Lovable within seconds
- Try refreshing Lovable editor

**Build loops occurring?**
- The `[skip ci]` tag prevents infinite loops
- Verify tag is present in workflow commit messages
- Check workflow isn't triggered by its own commits

**CDN cache not purging?**
- Check workflow logs for purge step errors
- Manually purge: `curl https://purge.jsdelivr.net/gh/{repo}@main/public/widget-dist/creekside-chatbot-widget.js`
- Wait a few minutes and try again

### Deployment Flow Diagram

```
Code Change → Push to GitHub → GitHub Actions Trigger
                                       ↓
                              Build Both Widgets
                                       ↓
                              Commit to Repository
                                       ↓
                              Purge CDN Cache
                                       ↓
                              Live on jsDelivr CDN (Global)
                                       ↓
                              Client Sites Auto-Update
```

### Further Reading
- Full deployment guide: `DEPLOYMENT.md`
- Build instructions: `BUILD_INSTRUCTIONS.md`
- jsDelivr documentation: https://www.jsdelivr.com/documentation
