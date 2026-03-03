# Proposal: Method 1248 Manual for Secure Key Storage

## Purpose
Define a practical and auditable procedure for storing recovery material using a “1248” structure.

## Status
Draft proposal for discussion. Not yet a finalized operational standard.

## Proposed 1248 Structure (Draft)
1. **1 primary source of truth**
- One canonical recovery phrase record, created and verified in an offline environment.

2. **2 geographically separated backups**
- Two physically separate storage locations to reduce single-site failure risk.

3. **4 protection layers**
- Tamper-evident packaging.
- Environmental resilience (fire/water considerations).
- Access control policy (who can access and when).
- Documented retrieval procedure.

4. **8 recurring verification checks**
- Periodic integrity and readability checks (without exposing data online).
- Recovery drill checkpoints to validate process continuity.

## Tutorial Integration Plan
- Keep manual access separate from tabs (dedicated entry point).
- Introduce a progressive checklist workflow once approved.
- Include “do/don’t” scenarios and incident response mapping.

## Security Constraints
- No secret persistence in the app.
- No cloud upload or remote sync.
- No copy-to-clipboard automation for sensitive values.

## Acceptance Criteria
- Manual defines clear steps that can be executed repeatedly.
- Users can complete all checkpoints without ambiguity.
- Recovery drill process is measurable and documented.

## Open Questions for Discussion
- Is “1248” the final mnemonic for the workflow or should naming change.
- Exact cadence for the 8 verification checks.
- Solo custody vs shared/family custody variants.
