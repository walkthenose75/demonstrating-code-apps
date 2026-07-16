# Rollup columns for resource count and usage count

**Status:** accepted

Coverage and Reuse are surfaced through Dataverse **rollup columns** —
`pt_resourcecount` on Project (count of Assignment children) and
`pt_usagecount` / `pt_lastusedon` on Resource — rather than being computed in
the app on every read. The trade-off is Dataverse rollups recalculate
asynchronously (minutes of latency, hourly system job), so a freshly logged
project may briefly show a stale count; the app therefore also computes an
optimistic count client-side for the just-edited record. We accept
eventual-consistency on rollups in exchange for cheap, index-friendly aggregate
reads that power the dashboards without fan-out queries. Recorded because the
async-latency behavior is surprising to anyone expecting rollups to be instant.
