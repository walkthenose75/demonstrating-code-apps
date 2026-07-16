# Reuse OOB `account` and `systemuser`; no custom Customer/Seller tables

**Status:** accepted

**Customer** maps to the out-of-the-box Dataverse `account` table and **Seller** /
**Presenter** / **Maintainer** all map to `systemuser`. We are not creating custom
tables for these concepts. Per `07a` OOB-first discipline, duplicating identity or
account entities in custom tables would fragment data, break OOB integrations, and
duplicate security constructs. The trade-off is minor loss of naming control (the
UI relabels `account` as "Customer" via the `DataverseFieldLabel` fallback pattern
rather than owning a `dat_customer` table). Recorded because a future reader may
expect a custom Customer/Seller table and needs to know the omission was deliberate.
