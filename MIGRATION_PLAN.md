# Technical Baseline and Evolution Plan

## Context
The repository is now consolidated around a single modern Bitcoin-focused application in `web/`.
Legacy multi-network code and deprecated build/test stacks were removed to reduce maintenance and security surface.

## Current Baseline
- Frontend stack: React + Vite + TypeScript (`strict`) + TailwindCSS v4.
- Scope: Bitcoin BIP39/BIP84/BIP86 derivation workflows.
- Runtime model: client-side sensitive processing only.
- Deployment model: static site on AWS via SST.
- UX model: bilingual UI (`English`, `Português (Brasil)`) and theme switching (`dark`, `light`).

## Security Baseline
- No mnemonic/seed/private key transmission to backend services.
- No secret persistence in browser storage.
- Masked secret output by default with explicit reveal toggle.
- Fast sensitive-session cleanup action in UI.
- Environment-aware CSP:
- strict production CSP;
- development CSP allowing local DX requirements (HMR).

## Repository Boundaries
- Primary app: `web/`.
- Infrastructure: `sst.config.ts`.
- Root scripts orchestrate workspace commands (`npm run dev`, `npm run build`, etc.).
- Removed from active scope:
- legacy `src/`, `tests/`, and bundled third-party `libs/`;
- legacy Python compile workflow.

## Evolution Plan

## 1. Bitcoin Feature Expansion
- Add BIP44 and BIP49 derivation flows.
- Expand vector-backed tests for every newly exposed standard.
- Keep strict-default behavior and isolate non-standard options.

## 2. Quality and CI Hardening
- Add CI gates for lint, tests, typecheck, and build.
- Add dependency/security checks in CI.
- Add E2E coverage for critical wallet workflows.

## 3. Release and Offline Operations
- Automate build checksum generation.
- Standardize release artifacts and verification steps.
- Keep deployment as static-only infrastructure.

## 4. Guided Tutorial Experience
- Convert current tool UX into a staged tutorial flow.
- Add concept checkpoints and practical task progression.
- Keep educational content aligned with implemented derivation behavior.

## Operational Risks and Mitigations
- **Risk:** regression when adding new derivation standards.
  - **Mitigation:** official vectors + regression suite before enabling in UI.
- **Risk:** frontend dependency vulnerabilities.
  - **Mitigation:** lockfile discipline, audits, and CI security checks.
- **Risk:** accidental scope drift away from Bitcoin-only focus.
  - **Mitigation:** repository boundaries and explicit feature acceptance criteria.
