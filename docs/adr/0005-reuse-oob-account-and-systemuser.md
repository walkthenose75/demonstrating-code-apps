# Reuse OOB `account` and `systemuser`; no custom Client/Team tables

**Status:** accepted

**Client** maps to the out-of-the-box Dataverse `account` table and **Project
Lead** / **Owner** both map to `systemuser`. We are not creating custom tables for
these concepts. Per `07a` OOB-first discipline, duplicating identity or account
entities in custom tables would fragment data, break OOB integrations, and
duplicate security constructs. The trade-off is minor loss of naming control (the
UI relabels `account` as "Client" via the `DataverseFieldLabel` fallback pattern
rather than owning a `pt_client` table). Recorded because a future reader may
expect a custom Client/Team table and needs to know the omission was deliberate.
