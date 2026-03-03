# Guided Tutorial + Practical Bitcoin Tool

## Goal
Evolve the solution into a hybrid experience:
1. Step-by-step tutorial to teach Bitcoin wallet fundamentals.
2. Operational tool to execute real derivation tasks safely.

## Current Implemented Scope
- BIP39 mnemonic generation (English wordlist).
- BIP39 mnemonic validation.
- Local seed derivation (client-side only).
- BIP39 `Strict` mode (default): 12/15/18/21/24 words and PBKDF2 set to 2048.
- BIP39 `Advanced` mode: custom PBKDF2 rounds with compatibility warning.
- BIP84 derivation (Native SegWit, `bc1q...` / `tb1q...`).
- BIP86 derivation (Taproot, `bc1p...` / `tb1p...`) with Bech32m.
- Robust derivation-path validation in TypeScript core.
- Protected secret visibility (masked by default) and quick sensitive-session cleanup.

## Concepts That Can Be Taught with the Current Solution

## 1. Entropy and Mnemonic Generation
- Concept: strong randomness defines initial wallet security.
- In practice: generate mnemonic phrases with valid BIP39 sizes.

## 2. Mnemonic, Checksum, and BIP39 Validation
- Concept: a recovery phrase is not a generic password; it has structure and checksum rules.
- In practice: validate phrase input and display clear invalid feedback.

## 3. BIP39 Passphrase
- Concept: same mnemonic + different passphrase => different seed and wallet.
- In practice: compare outputs by changing only the passphrase.

## 4. Seed and PBKDF2
- Concept: the seed is cryptographic material derived from mnemonic + passphrase.
- In practice:
- strict mode preserves interoperability (PBKDF2 2048);
- advanced mode demonstrates custom-round impact.

## 5. HD Wallet and Path-Based Derivation
- Concept: hierarchical wallet structure (account/change/index).
- In practice: change `account`, `change`, and derived address count.

## 6. Modern Addressing Standards
- Concept: differences between BIP84 (SegWit v0) and BIP86 (Taproot).
- In practice: switch standards and observe address type changes (`bc1q` vs `bc1p`).

## 7. Bech32 vs Bech32m
- Concept: witness-version-dependent encoding formats.
- In practice: BIP84 uses Bech32; BIP86 uses Bech32m.

## 8. Operational Security
- Concept: local/offline usage reduces attack surface.
- In practice: no backend is involved in mnemonic/seed/key processing.

## Useful Features for Real Bitcoin Usage

## A. Wallet Creation and Recovery
- Generate a BIP39 mnemonic.
- Validate an existing mnemonic.
- Derive seed locally for verification and interoperability.

## B. Receiving/Organization Derivation
- Select network (mainnet/testnet).
- Select standard (BIP84/BIP86).
- Derive addresses by account and branch (`change/index`).

## C. Cross-Tool Compatibility
- Show `account xpub` for watch-only scenarios.
- Show full `account path` for auditing/integration.

## D. Daily Security Controls
- Seed/private keys masked by default.
- Explicit toggle to reveal secrets.
- Dedicated action to clear sensitive session data.

## Recommended Tutorial Structure (Step-by-Step)
1. Module 1: Basic safety (entropy, mnemonic, backup discipline).
2. Module 2: Mnemonic to seed (passphrase and PBKDF2).
3. Module 3: Practical HD derivation (account/change/index).
4. Module 4: Modern addresses (BIP84 vs BIP86, Bech32 vs Bech32m).
5. Module 5: Secure operation (offline-first, operational hygiene, watch-only).

## Suggested Future Evolution (Not Implemented Yet)
- Expand UI coverage for additional standards (BIP32/BIP44/BIP49/BIP141) with guided explanations.
- Add quiz/checkpoint modules for each tutorial step.
- Add didactic export for a derivation report without sensitive data.

## Security Rules That Must Remain
- Never send mnemonic/seed/private key data to backend services.
- Never persist secrets in `localStorage`, `sessionStorage`, or cookies.
- Avoid third-party runtime scripts.
- Keep explicit offline-operation guidance for trusted environments.

## Expected Outcome
The solution teaches essential Bitcoin wallet concepts while enabling practical, auditable execution of high-value wallet tasks, with focus on interoperability and operational security.
