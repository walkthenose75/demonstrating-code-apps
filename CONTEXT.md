# Project Tracker

Project Tracker is a portfolio tracker for teams. Team members log the projects
they run for clients and link the reusable resources behind each project; leaders
use the resulting data to report on **resource coverage** — how much of the team's
project activity is backed by reusable resources versus run one-off.

The business goal is not just to list projects — it is to **raise the reuse rate
of resources** by making coverage, reuse, and at-risk projects visible across
med-tech, pharma, and general-business portfolios.

## Language

**Project**:
A single engagement in which a **Team** delivered work for a **Client**, started
on a date. The core record of the app. One Project Lead, one Client, one start
date, one primary **Practice Area**.
_Avoid_: delivery, engagement (informal), job, ticket

**Resource**:
A reusable asset that backs one or more projects — a document/template, a dataset,
a tool/system, a playbook/SOP, an environment/sandbox, or reference material.
Lives in a shared, org-owned library so any team member can find and reuse it.
_Avoid_: asset (too generic), material, collateral, artifact

**Assignment**:
The link that records that a specific **Project** used a specific **Resource**. A
junction record — a project can use many resources, a resource can be used across
many projects. Zero assignment rows on a project means it is **Unresourced**.
_Avoid_: link, mapping, join, usage

**Unresourced**:
A **Project** with zero linked **Resources** — run without any reusable resource
behind it. A derived state, not a stored flag: it is true exactly when the
project's resource count is zero. Drives the **At-Risk Projects** list.
_Avoid_: no-resource, story-only, empty

**Risk Reason**:
The reason an **Unresourced** project has no reusable resource (e.g. Not yet
resourced, Confidential / restricted, One-off effort, Using external vendor).
Turns raw unresourced projects into an actionable **At-Risk Backlog**.
_Avoid_: excuse, gap reason

**Coverage** (resource coverage):
The percentage of **Projects** in a given scope (team, lead, practice area, time
window) that are backed by at least one **Resource** — i.e. that are not
**Unresourced**. The app's headline metric.
_Avoid_: adoption, penetration, reuse rate (see Reuse)

**Reuse**:
How many distinct **Projects** a single **Resource** has backed. A
resource-centric metric (Coverage is project-centric). Drives the resource
leaderboard.
_Avoid_: usage count (reserve "usage" for the count field on a resource)

**At-Risk Backlog**:
The working list of **Unresourced** projects grouped by **Risk Reason**, framed as
a to-do list of resources worth building.
_Avoid_: gap list, backlog (unqualified)

**Practice Area**:
The discipline a project or resource sits in (e.g. Product Development, Regulatory
& Compliance, Clinical & Quality, Manufacturing & Supply, Commercial, IT &
Digital, Operations). Shared choice set across **Project** and **Resource** so
coverage can be cross-tabbed by area.
_Avoid_: category, department, workload, domain

**Project Lead**:
The team member who runs a given project, stored as a lookup on **Project**.
Usually the record owner, but captured explicitly to support shared engagements
where the owner and lead differ. Modeled on the out-of-the-box Dataverse
`systemuser` — never a custom table.
_Avoid_: presenter, manager, employee, user

**Client**:
The organization a project was delivered for. Modeled on the out-of-the-box
Dataverse `account` — never a custom table.
_Avoid_: customer, account (say "the Client"; "account" is the Dataverse table
name, not the business term), company

**Owner**:
The team member responsible for keeping a **Resource** current. A lookup on
Resource (`systemuser`).
_Avoid_: maintainer, author (say "Owner"; distinct from Dataverse record
ownership only in that it is a business lookup, not the ownerid)

**Maturity**:
The readiness of a **Resource** — Draft, Ready, Approved (Gold), or Retired. Lets
team members trust what they reuse and lets leaders retire stale resources.
_Avoid_: status (reserved for project lifecycle), quality, level

**Status**:
The lifecycle stage of a **Project** — Planning, In Progress, In Review, or
Complete. Distinct from **Outcome** (health) and from resource **Maturity**.
_Avoid_: stage, phase (informal)

**Outcome**:
The health signal of a **Project** — On Track, Monitoring, At Risk, or Delivered.
Distinct from the workflow **Status**.
_Avoid_: result, health (informal)
