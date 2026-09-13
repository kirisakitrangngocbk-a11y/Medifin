# Financial engine

`resolveRefinancing(state)` is pure and deterministic. It reads timing, debt evidence, reputation credibility and leverage (`debt / EBITDA`) and succeeds when at least three of those four conditions hold.

Financial Outcome derives a normalized state score from liquidity (cash and short-term liquidity), debt load, operating continuity, EBITDA, execution success, long-term health, refinancing status and bounded new-risk penalties. The main weights are 30%, 20%, 20%, 15% and 15%; long-term health and refinancing are state adjustments, and each created risk subtracts 0.5 points up to a six-point cap. Scores ≥63 are `STRONG_SURVIVAL`, 43–62 are `FRAGILE_SURVIVAL`, and scores below 43 are `FINANCIAL_COLLAPSE`. `shortTermLiquidity` and `longTermFinancialHealth` remain separate so an immediate cash increase cannot masquerade as recovery.
