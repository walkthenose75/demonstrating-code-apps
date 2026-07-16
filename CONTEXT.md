# Project Tracker

Project Tracker is a demo-asset tracker for sellers. Sellers log the demos they
deliver to customers and link the reusable assets behind each demo; leaders use
the resulting data to report on **demo-asset coverage** — how much of the team's
demo activity is backed by reusable assets versus delivered as story only.

The business goal is not to track projects — it is to **raise the reuse rate of
demo assets** by making coverage, reuse, and gaps visible.

## Language

**Demo Delivery**:
A single event in which a **Seller** delivered a demo to a **Customer** on a
date. The core record of the app. One Seller, one Customer, one date, one primary
**Solution Area**.
_Avoid_: Demo (ambiguous — see below), session, presentation, meeting

**Demo**:
Informal shorthand for a **Demo Delivery**. When precision matters, always say
"Demo Delivery" (the event) or "Demo Asset" (the artifact) — never bare "demo".
_Avoid_: using "demo" to mean the reusable artifact

**Demo Asset**:
A reusable artifact that backs one or more demos — a GitHub repo, a deployed
sandbox environment, a runbook/script, a recorded video, or an interactive
sandbox. Lives in a shared, org-owned catalog so any Seller can find and reuse it.
_Avoid_: resource, material, collateral, artifact (too generic)

**Demo Asset Usage**:
The link that records that a specific **Demo Delivery** reused a specific
**Demo Asset**. A junction record — a delivery can reuse many assets, an asset
can be reused across many deliveries. Zero usage rows on a delivery means it is
**Story Only**.
_Avoid_: link, mapping, join

**Story Only**:
A **Demo Delivery** with zero linked **Demo Assets** — delivered as a verbal or
slide narrative with no reusable asset behind it. A derived state, not a stored
flag: it is true exactly when the delivery's linked-asset count is zero.
_Avoid_: no-asset, verbal, slideware, story-mode

**Asset Gap Reason**:
The reason a **Story Only** delivery has no reusable asset (e.g. Not yet built,
Not assetizable / confidential, One-off, Used a partner asset). Turns raw
uncovered deliveries into an actionable **Coverage Gap Backlog**.
_Avoid_: excuse, no-asset reason

**Coverage**:
The percentage of **Demo Deliveries** in a given scope (team, Seller, Solution
Area, time window) that are backed by at least one **Demo Asset** — i.e. that are
not **Story Only**. The app's headline metric.
_Avoid_: adoption, penetration, reuse rate (see Reuse)

**Reuse**:
How many distinct **Demo Deliveries** a single **Demo Asset** has backed. An
asset-centric metric (Coverage is delivery-centric). Drives the asset leaderboard.
_Avoid_: usage count (reserve "usage" for the junction record)

**Coverage Gap Backlog**:
The working list of **Story Only** deliveries grouped by **Asset Gap Reason**,
framed as a to-do list of assets worth building.
_Avoid_: gap list, backlog (unqualified)

**Solution Area**:
The product/technology area a demo covers (e.g. Azure Infrastructure, Data & AI,
Security, Modern Work, Business Applications, Copilot). Shared choice set across
**Demo Delivery** and **Demo Asset** so coverage can be cross-tabbed by area.
_Avoid_: category, product, workload, domain

**Seller**:
An internal user who delivers demos and logs **Demo Deliveries**. Modeled on the
out-of-the-box Dataverse `systemuser` — never a custom table. Owns their own
Demo Delivery records.
_Avoid_: rep, presenter (see below), employee, user

**Presenter**:
The Seller who actually delivered a given demo, stored as a lookup on **Demo
Delivery**. Usually the record owner, but captured explicitly to support
co-selling where the owner and presenter differ.
_Avoid_: speaker, host

**Customer**:
The external organization a demo was delivered to. Modeled on the out-of-the-box
Dataverse `account` — never a custom table.
_Avoid_: client, account (say "the Customer"; "account" is the Dataverse table
name, not the business term), company

**Maintainer**:
The Seller responsible for keeping a **Demo Asset** current. A lookup on Demo
Asset (`systemuser`).
_Avoid_: owner (reserved for Dataverse record ownership), author

**Maturity**:
The field-readiness of a **Demo Asset** — Draft, Field-ready, Certified (Gold),
or Deprecated. Lets Sellers trust what they reuse and lets leaders retire stale
assets.
_Avoid_: status (reserved for record lifecycle), quality, level
