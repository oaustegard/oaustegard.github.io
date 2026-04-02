# Token Salary Calculator

A task-first calculator that flips the standard framing of AI token costs for engineering teams. Instead of asking "how many tokens should each engineer get?", it asks: **"What does it cost to ship N tasks per day?"**

## Background

Riffs on [Paul Kinlan's "The Token Salary"](https://aifoc.us/the-token-salary/) analysis, which compares two models:
- **Jensen Huang's model**: Keep all engineers, add 50% of their salary in token budget
- **Steve Yegge's model**: Cut 50% of engineers, redirect their salaries to token budgets for the rest

## What This Calculator Does

- Starts from a daily task target (default: 200 tasks/day)
- Models the 8-hour engineering day as a split between doing tasks and overseeing AI
- Hard-caps at 8 hours — token budgets exceeding oversight capacity are flagged as waste
- Compares: Baseline (humans only), Huang, Yegge, Minimum Viable Team, and Pure Tokens
- Shows geographic arbitrage across salary bands
- Includes workflow presets from "Copilot assist" to "Fully autonomous"

## Key Insight

Both Huang's and Yegge's models tie token budgets to salary formulas rather than to actual work requirements. The "Minimum Viable Team" scenario sizes the team and token budget to the work itself — the smallest team with enough oversight hours to hit the target.

## Pricing

Uses Claude Opus 4.6 at list price ($1.90/1M input, $25/1M output), no caching discount. Output token ratio is adjustable (default 7%).

Built with Preact + HTM.
