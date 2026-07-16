# Ownership split: org-owned resource library, user-owned projects

**Status:** accepted

**Resource** records are **Organization-owned** (a shared library every team member can find and reuse), while **Project** and **Assignment** records are **User-owned** (each team member owns and is accountable for their own logged projects). Dataverse ownership type is set at table creation and is effectively immutable, so this is a hard-to-reverse decision. The trade-off: org-owned resources cannot be per-record shared or assigned and rely on a single org-wide read privilege (correct for a library, wrong for personal data), whereas user-owned projects give each team member a natural "my projects" boundary while leaders read across the org via role scope. Mixing the two ownership models in one app is non-obvious to a future reader, hence this record.
