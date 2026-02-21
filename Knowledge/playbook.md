# Playbook — Institutional Knowledge
*Started: Feb 16, 2026 | Source: T9 Healthcare Simulator Build*

---

## Tool Selection Rules

- **If it involves files, deployment, or iteration → Claude Code. Always.**
- Chat interface is for strategy, research, brainstorming, writing. Not building.
- The T9 simulator was 800+ lines of React built through chat — full-file rewrites every change, no live preview, no linting, no git. Claude Code would have cut the build from ~4 hours to under 1.

## Stack Defaults

- **Vite + React + Tailwind + Vercel** is the default for any interactive web artifact.
- Install Tailwind BEFORE first render test. Without it, every class renders as nothing — blank white page.
- Deploy config (vercel.json or equivalent) goes in at project creation, not after the build is done.
- Vercel account is set up. `vercel --prod` from Claude Code = live URL in 30 seconds.

## Deploy Checklist

1. Stack confirmed (Vite + React + Tailwind)
2. Tailwind installed and configured
3. Local test passes (all tabs, interactivity, mobile)
4. `vercel --prod`
5. Custom domain mapped (Namecheap → A record → 76.76.21.21)
6. Smoke test on live URL + phone
7. Screenshot for LinkedIn post

## Demo Strategy

- **Demo live on calls. Never send the link ahead.**
- You want to see their faces when you pull it up. Reaction = information + leverage.
- If you send it beforehand, the "wow" moment happens in private where it doesn't benefit you.
- On call: "I put something together using only public data. Can I share my screen for 5 minutes?"
- After call: send link + password with "Built in a day with public data — imagine what's possible with the real numbers."
- That line plants the advisor/hire seed.

## Delivery Format

- **Interactive web app > PDF. Always.**
- Password-protected, branded humaninthelead.ai subdomain per client/prospect.
- Every prospect deliverable doubles as a portfolio piece. The simulator exists for Transform9 but lives on humaninthelead.ai forever.
- Anonymize enough for portfolio use, specific enough to impress the prospect.

## Research → Build Pipeline

- Web research → synthesize → strategic framework → interactive artifact.
- This pipeline (T9: zero knowledge → password-protected 5-tab simulator in one session) is the future ShelfScore audit delivery model.
- Each audit = interactive branded web app, not a static report.

## Patterns — How I Work

- I build best late at night but pay for it the next day. Factor recovery time into scheduling.
- I tend to overcommit on Sundays before big Monday calls.
- I scope-creep builds ("add one more tab" becomes 3 more hours). Set a stopping point before starting.
- I rush to deploy before testing. Always do the smoke test.

## Mistakes — Never Repeat

- Building complex React apps in chat instead of Claude Code (Feb 16 — cost ~3 extra hours)
- Forgetting Tailwind dependency until deploy time (would have been a blank page in production)
- Not having deploy pipeline decided before writing line 1
- Trying to add features after "this is done" — the last 20% of polish takes 80% of remaining time

## DNS Reference

- Domain: humaninthelead.ai
- Registrar: Namecheap
- DNS: Namecheap Advanced DNS
- Vercel subdomain pattern: A record → host: [subdomain] → value: 76.76.21.21
- Example: t9.humaninthelead.ai → A record, host: t9, value: 76.76.21.21

---

## Strategic Frameworks — AI Transformation

*Added: Feb 20, 2026 | Source: LinkedIn comment on Rachel Woods post, co-developed with Claude*

### Where AI Disruptors Have a Disadvantage in Enterprise

**1. Regulated industries aren't slow — they're accountability-anchored.**
In financial services, healthcare, and energy, certain functions (model risk, fiduciary decisions, licensed professional judgment) aren't inefficient. Liability requires a human signature. That makes them AI-augmented-with-accountability, not AI-replaceable. A structural moat, not a weakness.

**2. The carve-out beats the transformation.**
You can't rebuild legacy inside legacy at speed. Spin up AI-native separately, prove the model, buy it back under a TSA-like structure. Prove outside. Reintegrate under governance.

**3. Three things AI still can't absorb:**
- Consequence ownership — it can't face a regulator or take the board call
- Trust built under pressure — C-suites still buy from humans they've tested
- Ambiguity arbitration — when the system can't decide, someone has to. That role gets more valuable, not less

### Amplified Intelligence
Working with LLMs as co-intelligence — not just for tasks, but to go deep on a wide range of topics fast. The edge isn't human vs. AI. It's who uses AI to make better strategic moves faster. This is the next evolution of how I work and how I position.

---

*Update this after every build. The goal is to never make the same mistake twice.*
