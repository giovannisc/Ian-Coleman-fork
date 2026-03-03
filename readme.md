# BIP39 Bitcoin Wallet Tool

Focused Bitcoin wallet derivation project built with:
- React
- Vite
- TypeScript
- TailwindCSS v4
- SST (AWS static deploy)

This repository has been cleaned to keep only the current Bitcoin-focused application.

## Scope
- BIP39 mnemonic generation and validation (English wordlist).
- BIP39 strict mode by default (12/15/18/21/24 words, PBKDF2=2048).
- BIP84 and BIP86 derivation for mainnet/testnet.
- Local-only sensitive processing (no backend key handling).
- UI localization (`English`, `Português (Brasil)`).
- UI themes (`dark`, `light`).

## Project Structure
- `web/`: main application.
- `sst.config.ts`: AWS static site deploy configuration.
- `MIGRATION_PLAN.md`: technical baseline and evolution plan.
- `roadmap-typescript-bitcoin-standards.md`: implementation roadmap and status.
- `DEPLOY_AWS_SST.md`: deploy instructions.
- `release_process.md`: release workflow.

## Development
From repository root:

```bash
npm install
npm run dev
```

## Validation
```bash
npm run lint
npm run test
npm run build
```

## Deployment
```bash
npm run deploy
```

## Security Notes
- No mnemonic/seed/private key is sent to backend services.
- No secret persistence in browser storage.
- Production build uses hardened CSP policy.

## License
MIT. See `LICENSE`.
