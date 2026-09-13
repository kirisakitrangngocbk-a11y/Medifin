# Governance and family engine

Governance is resolved independently of Financial Outcome. Disclosure of HS-G, Governance & Family preparation, family events and Houndstooth handling affect the governance state; financial collapse does not automatically reduce it.

The fictional Houndstooth contract stores `referenceEbitda = 792`, `measuredEbitda`, `measurementPeriod`, `triggerThreshold = 752.4`, `triggerStatus`, `exercisedStatus`, `controlLost` and `agreementVoided`. Houndstooth Capital may exercise only over a designated 12% family-held tranche; Michael is the consenting signatory, and the option does not cover the family's full 78% ownership. Trigger uses the strict rule `measuredEbitda < 752.4`, independent of whether the player opened HS-G; HS-G controls knowledge and provenance, not the underlying event. Exercise and control loss are separate transitions. A triggered right without Governance & Family preparation creates a modeled stakeholder pressure event; continuity below 45 after exercise records control loss. PD-E may set `agreementVoided` under the case's fictional contractual assumption, which prevents the old agreement from triggering later.

An unprepared or low-scoring family state remains `FAMILY_FRACTURED` unless the explicit exercise/control transition sets `controlLost`; a low governance score alone never claims that legal control transferred.
