# Case 01 state dictionary

Every saved run includes `caseId`, `caseIdentity`, `schemaVersion`, `status`, `currentScreen`, `confirmedScreens`, `draftSelection`, `decisionHistory`, `evidenceLedger`, `eventLedger`, `reputation`, `proposedTreatment`, `implementedTreatment`, `approvalReputationSnapshot`, `timing`, `priorities`, `financialState`, `governanceState`, `familyState`, `houndstoothState`, `assumptions`, `invalidatedAssumptions`, `invalidatedAssumptionIds`, `reassessment` and `finalOutcome`.

Evidence entries track `status` (`CLUE`, `DISCOVERED`, `VERIFIED`, `DISPROVED`), `provenance`, source and screen. Status is monotonic; a later clue cannot downgrade a discovered or verified fact. Only discovered/verified facts are citable in the diagnosis picker. A fact repeated by BCTC receives a new provenance entry and does not unlock an unopened private dossier.

Reputation starts at 50 and is clamped to 0–100: LOW 0–39, MEDIUM 40–69, HIGH 70–100. The number is hidden during play and only its tier is shown at the final context section. It is separate from Counselor Performance.

Treatment approval stores both the proposed and implemented treatment plus the reputation snapshot. PD-A below MEDIUM and PD-F below HIGH are implemented as PD-B. The snapshot is immutable and later reputation changes do not rewrite Period 1.
