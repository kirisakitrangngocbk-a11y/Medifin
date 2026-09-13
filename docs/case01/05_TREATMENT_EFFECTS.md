# Treatment effects

Treatment cards describe actions only. Builder metadata resolves the implemented treatment after the M7 reputation snapshot.

| Treatment | State effect | Execution condition |
| --- | --- | --- |
| PD-A / Invest to Compete | Uses cash; improves EBITDA, continuity and long-term health when executed well. | Customers + Holiday Inventory + Employees. |
| PD-B / Deep Cost Cutting | Adds short-term cash and liquidity, while reducing EBITDA, continuity and long-term health. | Always executable; it is not equivalent to long-term recovery. |
| PD-C / Debt Restructuring | Reduces debt and improves liquidity/health when creditor preparation is present. | Creditors priority. |
| PD-D / Asset Sale | Adds liquidity but reduces EBITDA and continuity. | Customers or Governance & Family priority. |
| PD-E / Chapter 11 | Restructures debt with different cash and continuity effects based on preparation. | Suppliers + Creditors. |
| PD-F / Combined Restructuring | High upside across debt, EBITDA, continuity and long-term health when fully prepared; otherwise it carries execution downside. | Creditors + Suppliers + Governance & Family. |

The financial resolver reads the resulting state, including execution success and new risks. It never adds a fixed treatment score.
