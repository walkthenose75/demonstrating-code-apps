# Publisher prefix `dat` for Project Tracker

**Status:** proposed (must be confirmed before any Dataverse row exists — the prefix is immutable once data is provisioned)

The scaffold inherited the template default publisher prefix `contoso`, which is meaningless for this domain and would brand every table, column, and option set (`contoso_demodelivery`, `contoso_solutionarea`, …) with a placeholder for the life of the app. We are changing it to **`dat`** ("Demo Asset Tracker") — short, lowercase, unmistakably on-domain, and unlikely to collide with OOB or ISV prefixes. Alternatives considered: `demo` (risks reading like a throwaway sample and is near a reserved word), `dtrk` / `demotrk` (longer, no clearer). Because prefixes cannot be changed after data exists, this is recorded as an explicit gate: **confirm `dat` before provisioning.**
