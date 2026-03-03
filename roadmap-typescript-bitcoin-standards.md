# Improvement Roadmap (TypeScript + Bitcoin Standards)

## Objective
Keep evolving the project with modern Bitcoin standards, strict security defaults, and a maintainable TypeScript-first architecture.

## Implementation Status (Updated: March 3, 2026)

### Completed
- React + Vite + TypeScript (`strict`) + TailwindCSS v4 web application is in place.
- BIP39 flow implemented with strict default mode (12/15/18/21/24 words, PBKDF2=2048) and advanced compatibility mode.
- Bitcoin derivation implemented for BIP84 (Native SegWit, Bech32 `bc1q...` / `tb1q...`) and BIP86 (Taproot, Bech32m `bc1p...` / `tb1p...`).
- Taproot x-only handling and P2TR derivation integrated in TypeScript core.
- Derivation path validation hardened with edge-case unit tests.
- Official vectors (including BIP86) integrated in test suite.
- Sensitive data baseline implemented: client-side only processing, no secret persistence, masked secrets by default, and one-click sensitive cleanup.
- CSP hardening implemented with dynamic environment policy and production CSP without `style-src 'unsafe-inline'`.
- UI supports `English` and `Português (Brasil)`.
- UI supports `dark` and `light` themes.
- Workspace setup simplified: single root `npm install`, root `npm run dev`, and SST execution via `npx` (no internal SST package dependency).
- `vite-plugin-pwa` and service worker integration removed from web app.
- Project documentation updated to English.

## Remaining Gaps
- Broader Bitcoin standard coverage in UI/core (BIP44/BIP49/BIP141 and legacy compatibility flows).
- Extended key format interoperability improvements (where applicable for migration parity goals).
- Formal offline distribution flow with checksum/signature automation.
- End-to-end browser test coverage for critical user paths.
- CI enforcement for reproducible quality gates (lint/test/build/dependency checks).
- Progressive tutorial mode (step-by-step teaching flow) beyond current single-screen tool UX.

## Updated Priorities

## P0. Release Hardening and Operational Safety
- Add automated artifact checksum generation and verification docs/scripts.
- Add dependency security scanning in CI (`npm audit` policy + pinned lockfile workflow).
- Add optional build-size optimization (code-splitting) to reduce large bundle warnings.
- Keep CSP policy strict in production and validate headers in deploy pipeline.

Acceptance criteria:
- Every release includes checksum artifacts and verification instructions.
- CI blocks merges on failing lint/test/build/security checks.
- Production deploys pass CSP/header validation checks.

## P1. Bitcoin Standard Coverage Expansion
- Add additional derivation standards to UI/core (starting with BIP44 and BIP49).
- Expand vector tests for each new supported standard.
- Preserve strict separation between standard-safe defaults and advanced options.

Acceptance criteria:
- New standards produce deterministic outputs validated by trusted vectors.
- No regressions for BIP39/BIP84/BIP86 existing flows.

## P1. Test and CI Maturity
- Add E2E tests for mnemonic generation, derivation, masking/reveal controls, and mode switching.
- Add CI workflow with required status checks for lint, unit tests, typecheck, and build.
- Add smoke test for locale/theme switching.

Acceptance criteria:
- Pull requests require passing CI gates.
- Critical wallet workflows are covered by automated browser tests.

## P2. Guided Tutorial Evolution
- Introduce structured tutorial modules (concept -> guided action -> validation).
- Add checkpoints/quizzes and “safe operation” guidance in flow.
- Add optional non-sensitive derivation report export for learning/auditing.

Acceptance criteria:
- Users can complete an end-to-end guided tutorial path.
- Tutorial content remains aligned with implemented derivation behavior.

## Backlog Snapshot

### Done
- [x] Define TypeScript stack and strict configuration.
- [x] Migrate derivation path validation to TypeScript + tests.
- [x] Update Bitcoin libraries for Taproot-capable stack.
- [x] Implement Bech32m and BIP86/P2TR derivation.
- [x] Add BIP86 vectors to tests.
- [x] Keep BIP39 strict mode as default.
- [x] Isolate advanced compatibility-breaking options.
- [x] Remove `vite-plugin-pwa` usage.
- [x] Add EN + PT-BR UI localization.
- [x] Add dark/light theme switching.
- [x] Harden CSP for production build.
- [x] Standardize project docs in English.
- [x] Simplify workspace install/run flow (`npm install` + root scripts).

### Next
- [ ] Add BIP44/BIP49 flows.
- [ ] Add E2E tests and CI required checks.
- [ ] Add release checksum/signature automation.
- [ ] Add guided tutorial module system in-app.

## Rollout Notes
- Continue shipping in small, frequent increments.
- Keep backward compatibility for currently supported standards.
- Require regression checks before enabling each new standard in the UI.
