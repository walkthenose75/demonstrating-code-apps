# Rollup columns for linked-asset count and reuse count

**Status:** proposed

Coverage and Reuse are surfaced through Dataverse **rollup columns** —
`dat_linkedassetcount` on Demo Delivery (count of Demo Asset Usage children) and
`dat_reusecount` / `dat_lastusedon` on Demo Asset — rather than being computed in
the app on every read. The trade-off is Dataverse rollups recalculate
asynchronously (minutes of latency, hourly system job), so a freshly logged demo
may briefly show a stale count; the app therefore also computes an optimistic
count client-side for the just-edited record. We accept eventual-consistency on
rollups in exchange for cheap, index-friendly aggregate reads that power the
dashboards without fan-out queries. Recorded because the async-latency behavior is
surprising to anyone expecting rollups to be instant.
