# GitHub Actions Workflows

## Build Widget Workflow

**File:** `build-widget.yml`

### Purpose
Automatically builds the Shadow DOM chatbot widget (`chatbot-widget-v2.js`) whenever code is pushed to the repository.

### Triggers
- **Push to main/master branch**: Builds widget on every commit
- **Pull requests**: Builds widget to verify it compiles correctly
- **Manual dispatch**: Can be triggered manually from GitHub Actions tab

### What It Does
1. Checks out the code
2. Sets up Node.js 20
3. Installs dependencies with `npm ci`
4. Builds the widget using `vite build --config vite.config.widget.ts`
5. Checks if the widget file changed
6. If changed, commits the built widget back to the repository
7. Pushes the changes to the same branch

### Output
- Generates: `public/widget-dist/chatbot-widget-v2.js`
- Commits with message: `chore: auto-build widget [skip ci]`
- The `[skip ci]` tag prevents infinite build loops

### Benefits
- ✅ No manual build steps needed
- ✅ Widget is always up-to-date with latest code
- ✅ Deployment-ready on every push
- ✅ Syncs back to Lovable automatically via bidirectional GitHub sync
- ✅ Works with pull request reviews

### Manual Trigger
To manually trigger the workflow:
1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select "Build Widget" workflow
4. Click "Run workflow"

### Local Development
For local development, you can still build manually:
```bash
npx vite build --config vite.config.widget.ts
```

### Troubleshooting

**Widget not building?**
- Check the Actions tab for error logs
- Verify `vite.config.widget.ts` exists
- Ensure dependencies are correctly specified

**Changes not syncing to Lovable?**
- GitHub's bidirectional sync should happen automatically
- Check if the commit appears in your GitHub repository
- The widget file should sync to Lovable within a few seconds

**Build loops?**
- The `[skip ci]` tag in the commit message prevents this
- If you see loops, check that this tag is present in commit messages
