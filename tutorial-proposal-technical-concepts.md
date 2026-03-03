# Proposal: Technical Concepts Tutorial

## Purpose
Explain how standards and implementation details map to the wallet tool controls.

## Target Audience
- Developers, power users, and technical operators.
- Users migrating between wallets and validating interoperability.

## Learning Outcomes
- Understand BIP39 strict vs advanced implications.
- Understand derivation path anatomy (`purpose/coin/account/change/index`).
- Understand BIP84 vs BIP86 output differences and compatibility constraints.

## Suggested Module Outline
1. BIP39 processing pipeline and strict defaults.
2. Derivation path validation and edge cases.
3. Address standards: BIP84 and BIP86.
4. Network differences (mainnet/testnet) and safe testing workflow.

## Suggested In-App Activities
- Path sandbox with validation feedback.
- Standard switch demo showing deterministic differences.
- Compatibility warning simulation for non-standard PBKDF2 rounds.

## Acceptance Criteria
- Users can derive expected path/address output for guided examples.
- Users can identify invalid path examples and explain why.
- Users can articulate when advanced mode should be avoided.

## Open Questions for Discussion
- Include xpub-only tutorial mode now or later.
- Add export/import validation flows in this phase.
- Desired depth of cryptographic internals in this track.
