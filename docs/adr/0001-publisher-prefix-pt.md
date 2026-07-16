# Publisher prefix `pt` for Project Tracker

**Status:** accepted (the prefix is immutable once data is provisioned — confirm before any Dataverse row exists)

The scaffold inherited the template default publisher prefix `contoso`, which is meaningless for this domain and would brand every table, column, and option set (`contoso_project`, `contoso_practicearea`, …) with a placeholder for the life of the app. We use **`pt`** ("Project Tracker") — short, lowercase, unmistakably on-domain, and unlikely to collide with OOB or ISV prefixes. Alternatives considered: `proj` (longer, no clearer), `ptrk` / `projtrk` (longer). Because prefixes cannot be changed after data exists, this is recorded as an explicit gate: **confirm `pt` before provisioning.**
