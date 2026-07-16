#!/usr/bin/env node
// One-command, cross-platform launcher for the dataverse-provision skill.
//
//   npm run provision           # provision the dev environment from .env
//   npm run provision -- --dry-run   # validate the plan only (no auth, no writes)
//   npm run provision -- --target test   # target PP_ENV_TEST instead of dev
//
// Reads .env, picks the least-friction auth path available (Service Principal if
// AZURE_CLIENT_ID/SECRET are set, otherwise device-code), fills in the org URL,
// tenant, and solution, then execs skills/dataverse-provision/provision.py.
// Any extra flags after `--` are forwarded verbatim to provision.py.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const provisionPy = resolve(here, 'provision.py');

// ---- load .env (do not override values already in the real environment) ----
function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}
loadEnv(resolve(repoRoot, '.env'));

// ---- parse our own flags; forward the rest ----
const argv = process.argv.slice(2);
let target = 'dev';
const passthrough = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--target') {
    target = (argv[++i] || 'dev').toLowerCase();
  } else if (argv[i] === '--') {
    // ignore a bare separator (npm / shell may inject one)
    continue;
  } else {
    passthrough.push(argv[i]);
  }
}

const urlByTarget = {
  dev: process.env.PP_ENV_DEV,
  test: process.env.PP_ENV_TEST,
  prod: process.env.PP_ENV_PROD,
};
const url = urlByTarget[target];
const isDryRun = passthrough.includes('--dry-run');

// ---- choose auth path ----
const hasSpn =
  process.env.AZURE_CLIENT_ID &&
  process.env.AZURE_CLIENT_SECRET &&
  (process.env.AZURE_TENANT_ID || process.env.PP_TENANT_ID);
const auth = hasSpn ? 'env' : 'devicecode';
const tenant = process.env.AZURE_TENANT_ID || process.env.PP_TENANT_ID || '';
if (hasSpn && !process.env.AZURE_TENANT_ID && process.env.PP_TENANT_ID) {
  process.env.AZURE_TENANT_ID = process.env.PP_TENANT_ID;
}

// ---- build the python argument list ----
const args = [provisionPy];
if (!isDryRun) {
  if (!url) {
    console.error(
      `[provision] No URL for target "${target}". Set PP_ENV_${target.toUpperCase()} in .env.`
    );
    process.exit(1);
  }
  args.push('--url', url, '--auth', auth);
  if (auth === 'devicecode') {
    if (!tenant) {
      console.error(
        '[provision] Device-code auth needs a tenant. Set PP_TENANT_ID in .env, ' +
          'or provide AZURE_CLIENT_ID/SECRET for headless Service Principal auth.'
      );
      process.exit(1);
    }
    args.push('--tenant', tenant);
  }
  args.push('--ensure-solution');
  if (process.env.SOLUTION_UNIQUE_NAME) args.push('--solution', process.env.SOLUTION_UNIQUE_NAME);
}
args.push(...passthrough);

// ---- resolve a python interpreter ----
function pickPython() {
  const candidates =
    process.platform === 'win32' ? ['py', 'python', 'python3'] : ['python3', 'python'];
  for (const c of candidates) {
    const probe = spawnSync(c, ['--version'], { stdio: 'ignore' });
    if (!probe.error && probe.status === 0) return c;
  }
  return null;
}
const py = pickPython();
if (!py) {
  console.error('[provision] Python 3 not found. Install it, then re-run.');
  process.exit(1);
}
// `py` launcher needs an explicit -3 to avoid Windows Store stub weirdness.
if (py === 'py') args.unshift('-3');

console.log(
  `[provision] target=${target} auth=${auth}${isDryRun ? ' (dry-run)' : ` url=${url}`}`
);
const res = spawnSync(py, args, { stdio: 'inherit', cwd: repoRoot });
process.exit(res.status ?? 1);
