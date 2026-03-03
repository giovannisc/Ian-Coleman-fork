# BIP39 Offline Wallet Tool (React + Vite + Tailwind)

TypeScript frontend application for wallet derivation with 100% client-side processing.

## Security
- No mnemonic/seed/private-key data is sent to a server.
- Sensitive data is not persisted in `localStorage`/`sessionStorage`/cookies.
- Deployment is static (S3 + CloudFront via SST), with no cryptographic backend.

## Current Scope
- BIP39 mnemonic generation (English wordlist).
- BIP39 mnemonic validation.
- Seed derivation.
- Bitcoin BIP84 derivation (Native SegWit) for mainnet/testnet.
- Bitcoin BIP86 derivation (Taproot/Bech32m) for mainnet/testnet.
- BIP39 modes:
- `Strict` (default): 12/15/18/21/24 words and PBKDF2=2048.
- `Advanced`: allows custom PBKDF2 rounds with compatibility warning.
- Robust derivation-path validation in TypeScript core.
- UI language support for `English` and `Português (Brasil)`.

## Commands
```bash
# install dependencies (workspace root + web package)
npm install

# development
npm run dev

# production build
npm run build

# local preview of built app
npm run preview

# lint
npm run lint

# unit tests (official vectors included)
npm run test
```

## Local and Offline Usage
1. Run `npm run build`.
2. Serve `web/dist` locally with a static server (for example `npm run preview`).
3. Open the local URL in the browser.

For real funds, prefer an isolated environment and verify artifact checksums before execution.
