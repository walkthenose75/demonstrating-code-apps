# Power Apps Code Apps - GitHub Copilot Project Instructions

You are assisting with a Power Apps Code Apps solution built with TypeScript, React, Dataverse, Power Platform CLI, GitHub, and the microsoft/power-platform-skills starter template.

## How to use this workspace

This repo uses three layers of AI guidance:

1. **Instruction files** define the process and methodology.
2. **Power Platform Skills agents** provide specialized implementation guidance.
3. **Custom repo agents** provide orchestration, governance, QA, documentation, and ALM oversight.

Do not treat these as competing systems. Use them together.

## Always prefer the starter template process

Before planning or implementing a task, look for the most relevant instruction file in the workspace. The starter template instruction files are the source of truth for the build process.

Common instruction files include:

- `00-before-you-start.instructions.md`
- `00-environment-setup.instructions.md`
- `00-prereq-gate.instructions.md`
- `00a-business-problem-decomposition.instructions.md`
- `00b-scope-refinement-and-solution-shaping.instructions.md`
- `00c-solution-concept-to-dataverse-planning.instructions.md`
- `00d-prototype-validation.instructions.md`
- `00e-grill-and-document.instructions.md`
- `01-scaffold.instructions.md`
- `02-connectors.instructions.md`
- `03-components.instructions.md`
- `04-deployment.instructions.md`
- `05-testing.instructions.md`
- `06-security.instructions.md`
- `07-dataverse-schema.instructions.md`
- `07a-existing-schema-discovery.instructions.md`
- `07b-org-structure-and-security.instructions.md`
- `08-copilot-studio.instructions.md`
- `09-form-field-pattern.instructions.md`
- `10-publishing.instructions.md`

## Core principles

- Treat generated code as a first draft that must be reviewed, tested, and simplified before acceptance.
- Prefer clear, maintainable TypeScript over clever abstractions.
- Keep Power Platform governance, ALM, security, and licensing implications visible in recommendations.
- Use Dataverse as the primary system of record unless the user explicitly asks for another data source.
- Keep app logic separated into UI components, generated/client services, shared utilities, configuration, and deployment scripts.
- Do not hard-code environment-specific values, IDs, URLs, secrets, tenant names, or connection details.
- Use environment variables or documented configuration patterns for values that differ across dev, test, and prod.
- When creating or changing files, explain the purpose of each change and call out validation steps.
- If a starter template instruction file conflicts with a custom agent instruction, prefer the starter template instruction unless the user explicitly overrides it.

## Recommended operating model

- Use **PowerApps CodeApps Orchestrator** to define scope, backlog, and next-agent routing.
- Use Microsoft Power Platform Skills agents for specialized implementation work such as data modeling, screens, permissions, generated pages, web API integration, and offline profile planning.
- Use custom repo agents for ALM, QA/security, documentation, and cross-workstream governance.

## Response style

- Be concise but complete.
- Prefer numbered implementation steps for build work.
- Prefer code blocks for commands and file contents.
- Avoid vague statements like "configure it"; provide explicit file names, commands, and validation steps.
