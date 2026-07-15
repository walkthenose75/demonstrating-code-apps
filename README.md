# Project Tracker

A Power Apps Code App built with React, Fluent UI v9, TanStack Query, and TypeScript.

## Development

```bash
npm install
npm run dev:local
npm run prototype:seed
npm run dev
```

## Build and Deploy

```bash
npm run build
pac code push
```

## Power Platform

| Property | Value |
|----------|-------|
| Solution | x_Project Tracker |
| Publisher Prefix | `contoso` |

| Environment | URL |
|-------------|-----|
| Dev | https://org8599b1c0.crm.dynamics.com |
| Test | https://org0e6401b6.crm.dynamics.com |
| Prod | https://org04243e64.crm.dynamics.com |

Connector binding is intentionally deferred until the prototype is stable. Use WizardUX step 9 or `pac code add-data-source` when you are ready for real data.
