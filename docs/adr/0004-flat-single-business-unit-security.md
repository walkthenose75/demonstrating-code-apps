# Flat, single-business-unit security (org-wide leader visibility)

**Status:** accepted

Project Tracker intentionally uses a **single root business unit with no data-isolation boundaries**: leaders see all Sellers' deliveries org-wide, and the shared asset catalog is visible to everyone. We are deliberately *not* modeling regional/segment business units or owner teams, even though enterprise Dataverse apps often do. The trade-off is that this app cannot restrict one region/segment from seeing another's demo data — acceptable and desirable here because coverage reporting is inherently cross-team and this is a demonstration asset, not a data-sensitive system. This decision is recorded so that `07b-org-structure-and-security` does **not** invent unnecessary business units or teams, and so the `orgStructure` section of the planning payload is deliberately flattened.
