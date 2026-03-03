# BIP39 Offline Wallet Tool (React + Vite + Tailwind)

TypeScript frontend focused on Bitcoin wallet derivation with client-side-only sensitive processing.

## Security
- No mnemonic/seed/private-key data is sent to backend services.
- Sensitive data is not persisted in `localStorage`/`sessionStorage`/cookies.
- Production build uses strict CSP (no `style-src 'unsafe-inline'`).
- Deployment is static (S3 + CloudFront via SST), with no cryptographic backend.

## Current Scope
- BIP39 mnemonic generation and validation (English wordlist).
- BIP39 modes:
- `Strict` (default): 12/15/18/21/24 words and PBKDF2=2048.
- `Advanced`: custom PBKDF2 rounds with compatibility warning.
- Bitcoin derivation:
- BIP84 (Native SegWit) for mainnet/testnet.
- BIP86 (Taproot/Bech32m) for mainnet/testnet.
- Robust derivation-path validation in TypeScript core.
- UI language support for `English` and `Português (Brasil)`.
- UI theme support for `dark` and `light`.

## Commands
```bash
# install workspace dependencies (run at repo root)
npm install

# development
npm run dev

# production build
npm run build

# local preview of built app
npm run preview

# lint
npm run lint

# unit tests
npm run test
```

## Local and Offline Usage
1. Run `npm run build`.
2. Serve `web/dist` locally (for example `npm run preview`).
3. Open the local URL in a trusted environment.

For real funds, prefer isolated execution and verify artifact checksums before use.
