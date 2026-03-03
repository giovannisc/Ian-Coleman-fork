# Proposal: Mathematical Concepts Tutorial

## Purpose
Build intuition for the math that drives wallet security without requiring academic cryptography background.

## Target Audience
- Users who want deeper understanding of security assumptions.
- Technical learners who need practical intuition over formal proofs.

## Learning Outcomes
- Understand entropy quality and why randomness is critical.
- Understand checksum purpose in mnemonic validation.
- Understand one-way function intuition (hashes, key derivation hardness).
- Understand why brute-force attacks are infeasible at proper key-space scale.

## Suggested Module Outline
1. Entropy and randomness quality.
2. Mnemonic checksum intuition.
3. PBKDF2 rounds and computational work factors.
4. Key-space size and probability/risk framing.

## Suggested In-App Activities
- Interactive entropy quality examples.
- Checksum pass/fail demonstrations.
- Round-count performance/compatibility comparison.
- Risk visualization with key-space estimates.

## Acceptance Criteria
- Users can explain why low-entropy generation is unsafe.
- Users can explain checksum role and limitations.
- Users can reason about PBKDF2 tradeoffs (security vs compatibility).

## Open Questions for Discussion
- How much formal notation to include.
- Whether to add calculators directly in this tutorial tab.
- Whether to include historical attack case studies.
