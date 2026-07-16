# Model reusability as a Demo Asset Usage junction, not a boolean

**Status:** accepted

The user explicitly removed the single "Has Demo Assets?" Yes/Story-Only field. Instead of any boolean on the delivery, reusability is modeled at a richer grain: a **Demo Asset Usage** junction entity links each **Demo Delivery** to zero-or-more **Demo Assets**. **Story Only** becomes a derived state (zero linked assets) rather than a stored flag, and **Coverage** and asset **Reuse** both fall out of the same junction data. The trade-off is real: the junction adds a third table and a many-to-many write path in the UI (more complexity than a checkbox), but it unlocks reuse leaderboards, coverage cross-tabs, and per-asset analytics that a boolean can never produce — which is the entire point of a flagship demo app. This shape is hard to reverse once deliveries are logged, so it is recorded here.
