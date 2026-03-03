# AWS Deploy with SST

## Prerequisites
- AWS account configured locally (`aws configure` or AWS SSO).
- Node.js 20+.
- Repository dependencies installed from the project root (`npm install`).

## Current Configuration
- Infrastructure file: `sst.config.ts`
- Main resource: `sst.aws.StaticSite`
- Build output source: `web/dist`

## Deployment Flow
```bash
# install workspace dependencies (root + web)
npm install

# validate and build frontend
npm run build

# deploy static site with SST (via npx in script)
npm run deploy
```

## Notes
- Deployment publishes static assets only.
- No API/Lambda is used for mnemonic/seed/private-key processing.
- To remove non-production stage resources:
```bash
npx sst remove --stage <stage>
```
