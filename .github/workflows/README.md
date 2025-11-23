# GitHub Actions Workflows

This directory contains CI/CD workflows for the NovelSync project.

## Workflows

### `firebase-functions.yml`
Deploys Firebase Functions when changes are detected in the `functions/functions/` directory.

**When it runs:**
- Push to `main` or `develop` branches
- Manual trigger via workflow_dispatch

**What it does:**
1. Checks out code
2. Sets up Node.js 22
3. Installs dependencies
4. Runs linter
5. Builds functions
6. Deploys to Firebase

### `cloud-run-agents.yml`
Builds and deploys Python agents to Google Cloud Run.

**When it runs:**
- Push to `main` or `develop` branches
- Changes in `functions/agents/` or `functions/Dockerfile`
- Manual trigger via workflow_dispatch

**What it does:**
1. Checks out code
2. Sets up Python 3.11
3. Authenticates to Google Cloud
4. Builds Docker image
5. Pushes to Container Registry
6. Deploys to Cloud Run with environment variables

**Required Secrets:**
- `GCP_SA_KEY` - Google Cloud service account JSON
- `GOOGLE_AI_STUDIO_API_KEY` - Google AI Studio API key

### `ci.yml`
Runs linting and code quality checks on pull requests.

**When it runs:**
- Pull requests to `main` or `develop`
- Push to `main` or `develop` branches

**What it does:**
1. Lints Firebase Functions (TypeScript/ESLint)
2. Lints Python agents (flake8, black)

### `firebase-hosting-merge.yml` (existing)
Deploys frontend to Firebase Hosting on merge to main.

### `firebase-hosting-pull-request.yml` (existing)
Creates preview deployments for pull requests.

## Setting Up Secrets

See `DEPLOYMENT.md` for detailed instructions on setting up GitHub secrets.

## Troubleshooting

### Workflow fails at authentication
- Verify secrets are set correctly in GitHub repository settings
- Check that service account has required permissions

### Build fails
- Check logs in the Actions tab
- Verify dependencies are up to date
- Check for syntax errors in code

### Deployment fails
- Verify Firebase/Google Cloud project IDs match
- Check service account permissions
- Review deployment logs

