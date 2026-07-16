# Ownership split: org-owned asset catalog, user-owned deliveries

**Status:** accepted

**Demo Asset** records are **Organization-owned** (a shared catalog every Seller can find and reuse), while **Demo Delivery** and **Demo Asset Usage** records are **User-owned** (each Seller owns and is accountable for their own logged demos). Dataverse ownership type is set at table creation and is effectively immutable, so this is a hard-to-reverse decision. The trade-off: org-owned assets cannot be per-record shared or assigned and rely on a single org-wide read privilege (correct for a catalog, wrong for personal data), whereas user-owned deliveries give each Seller a natural "my demos" boundary while leaders read across the org via role scope. Mixing the two ownership models in one app is non-obvious to a future reader, hence this record.
