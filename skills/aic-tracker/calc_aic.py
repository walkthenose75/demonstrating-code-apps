#!/usr/bin/env python3
"""AIC (AI Consumption) calculator.

Turns raw per-model token telemetry into an accurate, cache-aware cost + credit
report and maintains a running session ledger so you can watch the cost climb
"as you go".

It is fed CUMULATIVE session-to-date token totals per model (a "snapshot"),
computes the cost, and diffs against the previous snapshot to show the delta
since the last checkpoint. That makes it safe to call repeatedly without
double-counting.

Input (JSON array), via --input FILE or stdin:
  [
    {"model": "claude-opus-4.8", "input_tokens": 6377999, "output_tokens": 78829,
     "cache_read_tokens": 5930367, "cache_write_tokens": 433155, "turns": 12}
  ]

Note: input_tokens is the TOTAL prompt tokens and INCLUDES cache read + write.
Fresh (uncached) input is derived as input_tokens - cache_read - cache_write.

Usage:
  python calc_aic.py -i snapshot.json --label "after UI build" --dir ./aic
  echo '[{...}]' | python calc_aic.py -i - --label checkpoint1 --dir ./aic
"""
from __future__ import annotations

import argparse
import csv
import datetime as _dt
import json
import os
import sys
from typing import Any


def load_pricing(path: str) -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def rate_for(model: str, pricing: dict[str, Any]) -> dict[str, float]:
    models = pricing.get("models", {})
    best_key = "default"
    best_len = -1
    low = (model or "").lower()
    for key in models:
        if key == "default":
            continue
        if low.startswith(key) and len(key) > best_len:
            best_key, best_len = key, len(key)
    return models.get(best_key, models["default"])


def cost_for(row: dict[str, Any], pricing: dict[str, Any]) -> dict[str, float]:
    model = row.get("model", "default")
    inp = float(row.get("input_tokens", 0) or 0)
    out = float(row.get("output_tokens", 0) or 0)
    cread = float(row.get("cache_read_tokens", 0) or 0)
    cwrite = float(row.get("cache_write_tokens", 0) or 0)
    turns = float(row.get("turns", 0) or 0)
    fresh = max(0.0, inp - cread - cwrite)
    r = rate_for(model, pricing)
    c_fresh = fresh * r["input"] / 1_000_000
    c_read = cread * r["cacheRead"] / 1_000_000
    c_write = cwrite * r["cacheWrite"] / 1_000_000
    c_out = out * r["output"] / 1_000_000
    total = c_fresh + c_read + c_write + c_out
    credits = turns * float(r.get("copilotMultiplier", 1))
    return {
        "model": model,
        "input_tokens": inp,
        "fresh_input_tokens": fresh,
        "cache_read_tokens": cread,
        "cache_write_tokens": cwrite,
        "output_tokens": out,
        "turns": turns,
        "cost_fresh": c_fresh,
        "cost_cache_read": c_read,
        "cost_cache_write": c_write,
        "cost_output": c_out,
        "cost_usd": total,
        "credits": credits,
    }


def money(x: float) -> str:
    return f"${x:,.4f}" if x < 1 else f"${x:,.2f}"


def humanize(seconds: float) -> str:
    seconds = int(round(seconds))
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    parts = []
    if h:
        parts.append(f"{h}h")
    if m or h:
        parts.append(f"{m}m")
    parts.append(f"{s}s")
    return " ".join(parts)


def parse_ts(value: str | None):
    if not value:
        return None
    v = value.strip().replace("Z", "+00:00")
    try:
        return _dt.datetime.fromisoformat(v)
    except ValueError:
        return None


def num(x: float) -> str:
    return f"{int(round(x)):,}"


def load_state(path: str) -> dict[str, Any]:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    return {"models": {}}


def main() -> int:
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(description="AIC cost + credit calculator")
    ap.add_argument("-i", "--input", default="-", help="JSON snapshot file, or - for stdin")
    ap.add_argument("--label", default="checkpoint", help="label for this checkpoint")
    ap.add_argument("--dir", default=os.path.join(here, "data"), help="dir for ledger + state")
    ap.add_argument("--pricing", default=os.path.join(here, "pricing.json"))
    ap.add_argument("--no-write", action="store_true", help="print only; do not persist")
    ap.add_argument("--reset", action="store_true", help="clear ledger + state, then run")
    ap.add_argument("--json", action="store_true", help="emit machine-readable JSON as well")
    ap.add_argument("--start", default=None, help="ISO timestamp of first activity (for wall time)")
    ap.add_argument("--end", default=None, help="ISO timestamp of last activity (default: now)")
    ap.add_argument("--active-seconds", type=float, default=None,
                    help="active model generation time; interpreted per --active-unit")
    ap.add_argument("--active-unit", choices=["ms", "s"], default="ms",
                    help="unit of --active-seconds (default ms)")
    args = ap.parse_args()

    pricing = load_pricing(args.pricing)
    raw = sys.stdin.read() if args.input == "-" else open(args.input, encoding="utf-8").read()
    try:
        rows = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"ERROR: invalid JSON input: {exc}", file=sys.stderr)
        return 2
    if isinstance(rows, dict):
        rows = [rows]

    os.makedirs(args.dir, exist_ok=True)
    state_path = os.path.join(args.dir, "aic-state.json")
    ledger_path = os.path.join(args.dir, "aic-ledger.csv")
    if args.reset:
        for p in (state_path, ledger_path):
            if os.path.exists(p):
                os.remove(p)

    prev = load_state(state_path)
    prev_models: dict[str, Any] = prev.get("models", {})

    per_model = [cost_for(r, pricing) for r in rows]
    cum_cost = sum(m["cost_usd"] for m in per_model)
    cum_credits = sum(m["credits"] for m in per_model)
    cum_in = sum(m["input_tokens"] for m in per_model)
    cum_out = sum(m["output_tokens"] for m in per_model)
    cum_cread = sum(m["cache_read_tokens"] for m in per_model)
    cum_cwrite = sum(m["cache_write_tokens"] for m in per_model)

    prev_cost = sum(m.get("cost_usd", 0) for m in prev_models.values())
    prev_credits = sum(m.get("credits", 0) for m in prev_models.values())
    d_cost = cum_cost - prev_cost
    d_credits = cum_credits - prev_credits

    ts = _dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    usd_per_credit = pricing.get("usdPerCredit")

    # ---- elapsed time ----
    start_dt = parse_ts(args.start)
    end_dt = parse_ts(args.end) or _dt.datetime.now(start_dt.tzinfo if start_dt else None)
    wall_seconds = None
    if start_dt is not None:
        wall_seconds = max(0.0, (end_dt - start_dt).total_seconds())
    active_seconds = None
    if args.active_seconds is not None:
        active_seconds = args.active_seconds / (1000.0 if args.active_unit == "ms" else 1.0)

    # ---- report ----
    line = "=" * 64
    print(line)
    print(f" AIC checkpoint: {args.label}    {ts}")
    print(line)
    for m in per_model:
        print(f" Model: {m['model']}")
        print(f"   fresh in {num(m['fresh_input_tokens'])} | cache-read {num(m['cache_read_tokens'])}"
              f" | cache-write {num(m['cache_write_tokens'])} | out {num(m['output_tokens'])}")
        print(f"   cost: fresh {money(m['cost_fresh'])} + read {money(m['cost_cache_read'])}"
              f" + write {money(m['cost_cache_write'])} + out {money(m['cost_output'])}"
              f"  =  {money(m['cost_usd'])}")
        if m["credits"]:
            print(f"   premium-request credits: {m['credits']:.2f}")
    print("-" * 64)
    print(f" Session tokens : in {num(cum_in)} (read {num(cum_cread)}, write {num(cum_cwrite)}), out {num(cum_out)}")
    print(f" Session COST   : {money(cum_cost)}")
    if cum_credits:
        print(f" Session CREDITS: {cum_credits:.2f} premium requests")
    if isinstance(usd_per_credit, (int, float)) and usd_per_credit:
        print(f" Credit-equiv   : {cum_cost / usd_per_credit:,.2f} credits (@ {money(usd_per_credit)}/credit)")
    if wall_seconds is not None:
        print(f" Build TIME     : {humanize(wall_seconds)} wall-clock"
              + (f"  ({humanize(active_seconds)} active generation)" if active_seconds is not None else ""))
    print(f" Since last     : +{money(d_cost)}"
          + (f" | +{d_credits:.2f} credits" if d_credits else ""))
    print(line)

    if not args.no_write:
        new_ledger = not os.path.exists(ledger_path)
        with open(ledger_path, "a", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            if new_ledger:
                w.writerow([
                    "timestamp", "label", "cum_input_tokens", "cum_output_tokens",
                    "cum_cache_read", "cum_cache_write", "cum_cost_usd", "cum_credits",
                    "delta_cost_usd", "delta_credits", "wall_seconds", "active_seconds",
                ])
            w.writerow([
                ts, args.label, int(cum_in), int(cum_out), int(cum_cread), int(cum_cwrite),
                round(cum_cost, 4), round(cum_credits, 2), round(d_cost, 4), round(d_credits, 2),
                int(wall_seconds) if wall_seconds is not None else "",
                round(active_seconds, 1) if active_seconds is not None else "",
            ])
        state = {"updated": ts, "label": args.label,
                 "wall_seconds": wall_seconds, "active_seconds": active_seconds,
                 "models": {m["model"]: m for m in per_model}}
        with open(state_path, "w", encoding="utf-8") as fh:
            json.dump(state, fh, indent=2)
        print(f" ledger -> {ledger_path}")

    if args.json:
        print(json.dumps({
            "label": args.label, "timestamp": ts,
            "wall_seconds": wall_seconds, "active_seconds": active_seconds,
            "cumulative": {"cost_usd": cum_cost, "credits": cum_credits,
                           "input_tokens": cum_in, "output_tokens": cum_out,
                           "cache_read_tokens": cum_cread, "cache_write_tokens": cum_cwrite},
            "delta": {"cost_usd": d_cost, "credits": d_credits},
            "per_model": per_model,
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
