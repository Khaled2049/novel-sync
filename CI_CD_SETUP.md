# CI/CD Setup Summary

This document summarizes the CI/CD setup for NovelSync using GitHub Actions.

## What Was Set Up

### 1. GitHub Actions Workflows

#### `.github/workflows/firebase-hosting-merge.yml`
- **Purpose**: Deploys frontend to Firebase Hosting on merge to main
- **Triggers**: Push to `main` branch
- **Steps**:
  1. Setup Node.js 22 with Yarn cache
  2. Install dependencies using `yarn install --frozen-lockfile`
  3. Build frontend using `yarn build`
  4. Deploy to Firebase Hosting live channel
- **Environment Variables**: All `VITE_*` secrets are passed during build

#### `.github/workflows/firebase-hosting-pull-request.yml`
- **Purpose**: Creates preview deployments for pull requests
- **Triggers**: Pull requests (only from same repository)
- **Features**:
  - Preview deployments expire after 7 days
  - Concurrency control to cancel in-progress deployments
  - Requires `checks: write` and `pull-requests: write` permissions
- **Steps**:
  1. Setup Node.js 22 with Yarn cache
  2. Install dependencies using `yarn install --frozen-lockfile`
  3. Build frontend using `yarn build`
  4. Deploy preview to Firebase Hosting

#### `.github/workflows/firebase-functions.yml`
- **Purpose**: Deploys Firebase Functions automatically
- **Triggers**: 
  - Push to `main`/`develop` when `functions/functions/**` changes
  - Changes to `.github/workflows/firebase-functions.yml`
  - Manual workflow dispatch
- **Steps**:
  1. Setup Node.js 22 with Yarn cache (`cache-dependency-path: functions/functions/yarn.lock`)
  2. Install dependencies using `yarn install --frozen-lockfile`
  3. Run linter (continues on error with `continue-on-error: true`)
  4. Build TypeScript functions using `yarn build`
  5. Setup Firebase CLI globally
  6. Authenticate to Firebase using service account JSON
  7. Deploy to Firebase Functions with `--force --no-predeploy` flags

#### `.github/workflows/cloud-run-agents.yml`
- **Purpose**: Builds and deploys Python agents to Cloud Run
- **Triggers**: 
  - Push to `main`/`develop` when `functions/agents/**` or `functions/Dockerfile` changes
  - Changes to `.github/workflows/cloud-run-agents.yml`
  - Manual workflow dispatch
- **Steps**:
  1. Setup Python 3.11
  2. Authenticate to Google Cloud using `google-github-actions/auth@v2` with `GCP_SA_KEY` secret
  3. Setup Cloud SDK using `google-github-actions/setup-gcloud@v2`
  4. Configure Docker for Google Container Registry (`gcloud auth configure-docker`)
  5. Build and push Docker image using `gcloud builds submit` (tags with `$GITHUB_SHA` and `latest`)
  6. Deploy to Cloud Run with:
     - Environment variables: `GOOGLE_CLOUD_PROJECT`, `VERTEX_AI_LOCATION`, `GOOGLE_AI_STUDIO_API_KEY`, `GOOGLE_AI_STUDIO_MODEL`
     - Resource limits: 1Gi memory, 1 CPU, 540s timeout
     - Scaling: 0-5 instances
  7. Display service URL with instructions for updating Firebase Functions
- **Permissions**: Requires `contents: read` and `id-token: write`

#### `.github/workflows/ci.yml`
- **Purpose**: Runs linting and code quality checks
- **Triggers**: Pull requests and pushes to `main`/`develop`
- **Jobs**:
  1. **lint_functions**:
     - Setup Node.js 22 with npm cache (`cache-dependency-path: functions/functions/package-lock.json`)
     - Install dependencies using `npm ci`
     - Run linter using `npm run lint`
     - Build functions using `npm run build`
  
  2. **lint_python**:
     - Setup Python 3.11
     - Install dependencies (pip, flake8, black, and requirements.txt)
     - Check code formatting with black (continues on error with `|| true`)
     - Lint with flake8 for specific error codes: E9, F63, F7, F82 (continues on error with `|| true`)

### 2. Docker Configuration

#### `functions/Dockerfile`
- Python 3.11 slim base image
- Installs dependencies from `requirements.txt`
- Exposes port 8000
- Includes health check
- Runs the FastAPI server

#### `functions/.dockerignore`
- Excludes unnecessary files from Docker build
- Reduces image size and build time

### 3. Google AI Studio API Integration

#### Updated `functions/agents/storyAgent/llm_provider.py`
- Added `GoogleAIStudioProvider` class
- Uses REST API with API key (instead of Vertex AI)
- Supports structured content generation with JSON schema
- Automatically selected when `GOOGLE_AI_STUDIO_API_KEY` environment variable is set

### 4. Cloud Build Configuration

#### `functions/cloudbuild.yaml`
- Alternative deployment method using Cloud Build
- Can be triggered manually or via Cloud Build triggers
- Includes all necessary build and deployment steps

## Required GitHub Secrets

Make sure these secrets are set in your GitHub repository:

1. **FIREBASE_SERVICE_ACCOUNT_NOVELSYNC_F82EC**
   - Firebase service account JSON
   - Used for Firebase Functions deployment

2. **GCP_SA_KEY**
   - Google Cloud service account JSON
   - Needs permissions: Cloud Run Admin, Service Account User, Storage Admin

3. **GOOGLE_AI_STUDIO_API_KEY**
   - Google AI Studio API key
   - Used by Python agents for AI generation

4. **VITE_API_KEY** (existing)
   - Google AI Studio API key for frontend

5. **Other VITE_* secrets** (existing)
   - Firebase configuration for frontend

## Next Steps

1. **Set up GitHub Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Add all required secrets listed above

2. **Get Google AI Studio API Key**
   - Visit https://makersuite.google.com/app/apikey
   - Create a new API key
   - Add it to GitHub secrets as `GOOGLE_AI_STUDIO_API_KEY`

3. **Configure Firebase Functions Environment**
   - After first Cloud Run deployment, get the service URL
   - Set `AGENT_SERVICE_URL` in Firebase Functions:
     ```bash
     firebase functions:config:set agent_service.url="https://story-agent-xxxxx.run.app"
     ```
   - Or set it in Firebase Console → Functions → Configuration → Environment variables

4. **Test the Deployment**
   - Push changes to `main` or `develop` branch
   - Check GitHub Actions tab for workflow runs
   - Verify deployments in Firebase Console and Cloud Run
   - **Important**: After Cloud Run deployment, check the workflow output for the service URL and update `AGENT_SERVICE_URL` in Firebase Functions if it changed

## Package Managers

Note that different workflows use different package managers:
- **Firebase Functions deployment** (`firebase-functions.yml`): Uses **Yarn** (`yarn install`, `yarn build`, `yarn lint`)
- **Firebase Functions CI** (`ci.yml`): Uses **npm** (`npm ci`, `npm run lint`, `npm run build`)
- **Frontend workflows**: Use **Yarn** (`yarn install`, `yarn build`)

This is intentional based on the package manager used in each directory.

## How It Works

### Deployment Flow

```
Push to main/develop
    ↓
GitHub Actions triggered
    ↓
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│                         │                         │                         │
│  Firebase Functions     │   Python Agents         │   CI                    │
│  Workflow               │   Workflow              │   Workflow              │
│                         │                         │                         │
│  1. Setup Node.js 22    │   1. Setup Python 3.11 │   1. Lint Functions     │
│  2. Install (yarn)      │   2. Auth to GCP       │   2. Lint Python        │
│  3. Lint (continue)     │   3. Setup Cloud SDK    │   3. Build Functions    │
│  4. Build (yarn)        │   4. Configure Docker   │                         │
│  5. Deploy Firebase     │   5. Build & Push Image │                         │
│                         │   6. Deploy Cloud Run   │                         │
│                         │   7. Display URL        │                         │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### AI Provider Selection

The Python agents automatically select the AI provider based on environment variables:

1. **Google AI Studio API** (default in production)
   - Used when `GOOGLE_AI_STUDIO_API_KEY` is set
   - Uses REST API with API key
   - Model: `gemini-2.0-flash-exp` (free tier, configurable)
   - **No Vertex AI required** - Uses direct REST API calls

2. **Ollama** (local development)
   - Used when `USE_OLLAMA=true` is set
   - For local testing without cloud services
   - Default fallback if `GOOGLE_AI_STUDIO_API_KEY` is not set

3. **Mock** (testing)
   - Used when `USE_MOCK=true` is set
   - Returns mock responses for testing

**Note**: Vertex AI is **not used** in this project. The service uses Google AI Studio API directly via REST API calls, which is simpler and doesn't require Vertex AI API enablement or service account authentication for AI calls.

## Troubleshooting

### Workflow fails
- Check GitHub Actions logs for specific errors
- Verify all secrets are set correctly
- Ensure service accounts have required permissions

### Functions not deploying
- Check Firebase service account secret format
- Verify project ID matches `.firebaserc`
- Review Firebase Functions logs

### Agents not deploying
- Verify `GCP_SA_KEY` is valid JSON
- Check service account has Cloud Run permissions
- Verify Docker build completes successfully (`gcloud builds submit`)
- Check Cloud Run deployment logs
- Ensure `id-token: write` permission is set in workflow

### Agents not responding
- Verify `GOOGLE_AI_STUDIO_API_KEY` is set in Cloud Run
- Check Cloud Run service logs
- Ensure `AGENT_SERVICE_URL` is set in Firebase Functions

## Additional Resources

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [functions/LOCAL_DEVELOPMENT.md](./functions/LOCAL_DEVELOPMENT.md) - Local development setup
- [.github/workflows/README.md](./.github/workflows/README.md) - Workflow documentation

