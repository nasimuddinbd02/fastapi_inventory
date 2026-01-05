# Environment Configuration Guide

## Environment Files

This project uses separate environment files for different deployment stages:

| File | Purpose | Auto-loaded by Next.js | Git Tracked |
|------|---------|------------------------|-------------|
| `.env.local` | Local development (your machine) | ✅ Yes | ❌ No (gitignored) |
| `.env.development` | Development mode | ✅ Yes (npm run dev) | ✅ Yes |
| `.env.production` | Production mode | ✅ Yes (npm run build) | ✅ Yes |
| `.env.test` | Testing | ✅ Yes (npm run test) | ✅ Yes |
| `.env.integration` | Integration testing | ❌ No (custom) | ✅ Yes |
| `.env.staging` | Staging/pre-production | ❌ No (custom) | ✅ Yes |
| `.env.local.example` | Template/documentation | ❌ No | ✅ Yes |

## Environment File Priority

Next.js loads environment files in this order (later files override earlier ones):
1. `.env` (all environments)
2. `.env.local` (all environments except test, gitignored)
3. `.env.development` / `.env.production` / `.env.test` (based on NODE_ENV)
4. `.env.development.local` / `.env.production.local` / `.env.test.local` (gitignored)

**Important:** `.env.local` always overrides other env files (except in test mode)

## Usage by Environment

### Local Development
```bash
npm run dev
```
Automatically loads: `.env.development` + `.env.local` (if exists)

### Integration Testing
```bash
# Option 1: Use env-cmd package
npx env-cmd -f .env.integration npm run build
npx env-cmd -f .env.integration npm start

# Option 2: Manually copy
Copy-Item .env.integration .env.local
npm run build
npm start
```

### Staging
```bash
# Option 1: Use env-cmd package
npx env-cmd -f .env.staging npm run build
npx env-cmd -f .env.staging npm start

# Option 2: In your CI/CD pipeline
# Copy .env.staging to .env.local before build
npm run build
npm start
```

### Production
```bash
npm run build
npm start
```
Automatically loads: `.env.production`

**Note:** In production deployments (Vercel, Netlify, AWS, etc.), set environment variables directly in the platform's dashboard rather than using files.

## Installing env-cmd (Optional)

For easier environment switching:

```bash
npm install --save-dev env-cmd
```

Then add scripts to `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "build:integration": "env-cmd -f .env.integration next build",
    "start:integration": "env-cmd -f .env.integration next start",
    "build:staging": "env-cmd -f .env.staging next build",
    "start:staging": "env-cmd -f .env.staging next start"
  }
}
```

## Environment Variables

### Required Variables
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL

### Optional Variables
- `NEXT_PUBLIC_API_VERSION` - API version (default: v1)
- `NEXT_PUBLIC_API_TIMEOUT` - Request timeout in ms (default: 30000)
- `NEXT_PUBLIC_API_DEBUG` - Enable debug mode (default: false)
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_DEFAULT_PAGE_SIZE` - Pagination size (default: 10)
- `NEXT_PUBLIC_ENABLE_USER_MANAGEMENT` - Enable user management (default: true)
- `NEXT_PUBLIC_ENABLE_AGENTS` - Enable agents feature (default: false)

## Configuration by Environment

| Environment | API Debug | Timeout | Agents Enabled |
|-------------|-----------|---------|----------------|
| Local | ✅ Yes | 30s | ❌ No |
| Development | ✅ Yes | 30s | ❌ No |
| Integration | ✅ Yes | 45s | ✅ Yes |
| Staging | ❌ No | 45s | ✅ Yes |
| Production | ❌ No | 60s | ❌ No |
| Test | ❌ No | 10s | ❌ No |

## First Time Setup

1. **For local development**, `.env.local` is already created with localhost settings
2. **Update API URLs** in integration, staging, and production files:
   - Replace `https://api-integration.yourdomain.com`
   - Replace `https://api-staging.yourdomain.com`
   - Replace `https://api.yourdomain.com`
3. **Customize feature flags** if needed
4. **Never commit** `.env.local` to git (it's in .gitignore)

## Deployment Platform Setup

### Vercel
1. Go to Project Settings → Environment Variables
2. Add all `NEXT_PUBLIC_*` variables
3. Set different values for Preview/Production

### AWS Amplify
1. Go to App Settings → Environment Variables
2. Add all variables per branch

### Docker
```dockerfile
# Pass environment variables at runtime
docker run -e NEXT_PUBLIC_API_BASE_URL=https://api.example.com my-app
```

Or use `.env` file:
```bash
docker run --env-file .env.production my-app
```

## Security Notes

- ⚠️ **Never** commit `.env.local` to version control
- ⚠️ **Never** put secrets in `NEXT_PUBLIC_*` variables (they're exposed to the browser)
- ✅ **Do** commit `.env.development`, `.env.production`, etc. (they're templates)
- ✅ **Do** use platform environment variables in production
- ✅ **Do** override sensitive values in deployment platform

## Troubleshooting

### Environment variables not updating?
1. Restart the dev server (`npm run dev`)
2. Check variable names start with `NEXT_PUBLIC_`
3. Verify `.env.local` isn't overriding your changes

### Which file is being used?
Add to your component:
```typescript
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
```

### Values showing as undefined?
- Environment variables are embedded at **build time**
- Rebuild the app after changing env files
- Use `NEXT_PUBLIC_` prefix for client-side variables
