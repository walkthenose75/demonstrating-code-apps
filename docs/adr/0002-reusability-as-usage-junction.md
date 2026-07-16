# Model reusability as an Assignment junction, not a boolean

**Status:** accepted

Reusability is modeled at a rich grain rather than as a boolean on the project: an **Assignment** junction entity links each **Project** to zero-or-more **Resources**. **Unresourced** becomes a derived state (zero linked resources) rather than a stored flag, and **Coverage** and resource **Reuse** both fall out of the same junction data. The trade-off is real: the junction adds a third table and a many-to-many write path in the UI (more complexity than a checkbox), but it unlocks reuse leaderboards, coverage cross-tabs, and per-resource analytics that a boolean can never produce — which is the entire point of a flagship portfolio app. This shape is hard to reverse once projects are logged, so it is recorded here.
