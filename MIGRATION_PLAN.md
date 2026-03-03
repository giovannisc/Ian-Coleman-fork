# Technical Migration Plan: React + Vite + Tailwind + SST

## Context
This repository previously contained a legacy JavaScript/jQuery wallet tool and is now consolidated into the modern TypeScript application under `web/`.
The goal remains preserving security, offline usage, and AWS deployment readiness.

## Goals
- Migrate the frontend to **React + Vite + TypeScript + TailwindCSS**.
- Keep sensitive processing **100% client-side**.
- Support **local and offline** execution.
- Deploy on AWS with **SST** as a static site.

## Security Requirements (non-negotiable)
- No mnemonic/seed/private key data may leave the browser.
- Do not use backend services for wallet derivation or cryptographic operations.
- Do not persist secrets in `localStorage`, `sessionStorage`, IndexedDB, cookies, or logs.
- Do not include trackers, analytics, or third-party runtime scripts.
- Keep reproducible builds and publish checksums for distributable artifacts.
- Warn users clearly when using non-standard compatibility options (for example custom PBKDF2 rounds).

## Target Architecture

## Frontend (`web/`)
- Vite + React + TypeScript (`strict: true`).
- TailwindCSS for UI styling.
- Wallet core in pure TypeScript modules (`web/src/core/*`) without DOM dependency.
- React presentation layer in `web/src/*`.

## Local and Offline Model
- Static production build (`web/dist`) runs without internet after dependencies are installed and build is generated.
- No required backend component for runtime.
- No runtime CDN dependencies (fonts/scripts).
- Optional packaging/distribution can provide checksum-verifiable offline artifacts.

## AWS Deployment (SST)
- Static hosting in S3 + CloudFront via `sst.aws.StaticSite`.
- Deploy only built frontend files.
- No API/Lambda for sensitive wallet logic.

## Migration Strategy by Phase
1. Foundation
- Scaffold React + TS + Tailwind.
- Implement in-memory safety baseline.
- Deliver initial Bitcoin flow (BIP39 + BIP84).
- Configure SST static site deploy.

2. Functional parity with legacy
- Migrate major flows and tabs.
- Port validation behavior.
- Add regression coverage.

3. Modern Bitcoin standards
- Add BIP86/Taproot + Bech32m.
- Update cryptographic dependencies.
- Expand official vector tests.

4. Final hardening
- Security review (CSP, headers, supply-chain posture).
- Checksum-verified distributable package.
- Operational security documentation.

## Phase 1 Acceptance Criteria
- React app running with strict TypeScript and Tailwind.
- BIP39 generation/validation and BIP84 derivation done in-browser only.
- No secret persistence in browser storage.
- Static build works in local/offline operation mode.
- AWS deploy with SST is configured and documented.

## Risks and Mitigations
- **Risk:** behavior divergence from legacy implementation.
  - **Mitigation:** official vector tests and progressive comparison.
- **Risk:** frontend/library security regressions.
  - **Mitigation:** minimal dependencies, periodic audits, and version control.
- **Risk:** offline mode breaks because of external runtime dependencies.
  - **Mitigation:** remove CDN/runtime fetch requirements and keep assets local.

## Immediate Next Steps
- Continue evolving the `web/` app with production-safe defaults.
- Keep Bitcoin core modules test-driven.
- Maintain deployment docs and security guardrails as features evolve.
