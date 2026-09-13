# Outcome engine

Counselor Performance is one process score with six weighted dimensions: Investigation 20%, Reasoning & Diagnosis 20%, Solution Suitability 25%, Communication 15%, Professionalism & Ethics 10%, Monitoring & Adaptation 10%. It is computed only at the final screen.

Financial Outcome is derived from simulated cash, debt, EBITDA, operating continuity, short-term liquidity, long-term financial health, refinancing status, execution success and new risks. Its normalized score keeps the main state weights (liquidity 30%, debt 20%, continuity 20%, EBITDA 15%, execution 15%), then adjusts for long-term health, refinancing status and a bounded new-risk penalty. It maps to `STRONG_SURVIVAL` (derived state score ≥63), `FRAGILE_SURVIVAL` (43–62) or `FINANCIAL_COLLAPSE` (<43); it does not add a manual treatment score. The threshold permits a high-liquidity path to remain financially strong while governance separately reaches control loss.

Governance & Family Outcome is derived independently from HS-G knowledge, disclosure, board/family preparation, priorities, family events and Houndstooth handling. It maps to `FAMILY_ALIGNED`, `FAMILY_FRACTURED` or `CONTROL_LOST`. Financial collapse does not automatically subtract governance.

The final ending is the 3×3 matrix of those two outcome axes. Reputation changes approval and stakeholder context, not the matrix cell. Houndstooth state keeps `triggerStatus`, `exercisedStatus`, `controlLost` and `agreementVoided` separate. Chapter 11 voiding is a fictional contract assumption and cannot later trigger the voided agreement without an explicit replacement contract.
