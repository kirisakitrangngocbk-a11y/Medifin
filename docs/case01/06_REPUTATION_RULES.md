# Reputation rules

Reputation starts at 50, is clamped to 0–100 and is hidden from the player until the final context section. LOW is 0–39, MEDIUM is 40–69 and HIGH is 70–100.

The deterministic adjustments are applied only when the relevant screen is confirmed: each selected dossier contributes its dossier credibility value minus 2; a non-management CH1 answer adds 2 while CH1-F adds −2; CH2-F and CH2-G add 2; diagnosis reasoning uses the selected evidence relationships (`SUPPORTS` +4, `CONTRADICTS` −6, `UNRELATED` −2, up to +2 contextual credit, with explicit deductions for unsupported reasoning). A mixed diagnosis receives an eligibility adjustment only when HS-D and at least one of HS-A/B/E/F are actually selected and cited.

M7 stores `approvalReputationSnapshot`. PD-A below MEDIUM and PD-F below HIGH are implemented as PD-B for Period 1. Later reputation changes cannot rewrite that historical approval.
