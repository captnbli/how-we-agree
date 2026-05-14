# Human-hearted Community of Practice (COP) — Design Context

This document captures the design principles for the platform. It is intended to be read by a coding assistant (e.g. Claude Code) starting work in this repo, so that the design constraints are known before any feature is built. Treat it as authoritative: features that conflict with these principles are wrong, even if they would be conventional elsewhere.

## What it is

A forum for people who have already met. Text messages, with light moderation. Anti-engagement by construction.

Slogan: **text messaging with warts but guardrails** — somewhere between SMS/WhatsApp (warts, no guardrails) and traditional forums (guardrails, no warts).

## Tech stack

- Next.js (App Router)
- TypeScript
- Postgres with Drizzle ORM
- Tailwind CSS
- Magic-link authentication

## Core design principles

### Membership precondition: prior real-world acquaintance

The community already exists offline. The software serves it; it does not manufacture it. This precondition is load-bearing: it means the platform never needs to solve the cold-start engagement problem, and it gives the trust model and the norms a foundation that pure-online platforms lack.

### Medium: text messages

Members post text messages. The register is informal — typos, half-thoughts, off-the-cuff replies are expected. Do not "improve" the medium into something more structured.

### Tempo: take time

"Take time" is a **stated norm**, not a structural mechanism. No posting cooldowns, no enforced delays, no rate limits as moderation. Circumstances vary — sometimes a real-time exchange is the kind thing, sometimes a week's pause is. The norm trusts members to read context; a cooldown would override the very judgment the platform is trying to cultivate.

The "in perpetuity" data retention (see Data model) quietly supports this: words that become part of perpetual community memory invite a different posting tempo than words that scroll into oblivion.

### Moderation: three strikes

Visible escalation. Not instant bans, not shadow moderation. Members can see when a strike has been called, why, and what the next step is. Three strikes leads to consensus exclusion.

### Onboarding: principle of charity

The orientation given to new members is the principle of charity, not terms of service. Most platforms answer first questions with rules ("here is what gets you banned"). This one answers with disposition ("here is how we read each other"). Different cultural seed entirely.

### Sanction authority: exclusion by consensus

The community, not a moderator class, decides who continues to participate. There is no appeals process inside the platform — the appeal route for guardrail-level disagreement is to fork (see Dissent mechanism).

### Guardrail: trusted participants

A recognised inner tier of members whose standing holds the norms. **Not moderators with admin powers** — they have authority by standing rather than by role. They are the ones who:

- Embody the principle of charity to newcomers
- Name the first strike when something drifts
- Form the core of any consensus to exclude
- Hold the "take time" norm by modelling it

How trust is conferred: design space. The leading candidate is inheritance from offline standing (the precondition does the work) with acclamation by existing trusted members for drift over time. Time-served alone would feel bureaucratic and miss the judgment dimension. Not yet settled — see Open design questions.

### Dissent mechanism: forking

Forking is the appeal route for disagreement **about the guardrails themselves** — the three-strikes mechanism, who counts as a trusted participant, how exclusion-consensus is reached. Day-to-day disagreement is handled inside the platform (principle of charity, three strikes, consensus). Meta-disagreement gets its own clean exit: take the code, run a different instance.

Implications for the codebase:

- The platform ships an opinion on each guardrail as a **default**, not a doctrine.
- Guardrail-relevant logic lives in clean modules with defined interfaces, so a fork can swap implementations without surgery.
- License and governance choices should support forking as a first-class action, not an exit of last resort.

### Three layers, three kinds of work

Worth holding visible while building:

1. **Build the platform** — code, defaults, architecture (this repo).
2. **Fork the platform** — others take it, modify the guardrails to fit their community, run their own instance.
3. **Run it in a real community** — the actual labour of being trusted, holding norms, modelling charity. This is the only layer that determines whether any of the rest matters.

The job of layer 1 is to make layer 3 possible without prescribing it, and to leave layer 2 clean enough that other communities can take the parts that fit and replace the ones that don't.

## Data model

### SOLID-style data ownership: personal records (PR)

Members own their posts. Following the SOLID model, each member has a **personal record (PR)** that holds their authoritative copies. The platform does not hold data hostage.

Terminology: use "personal record" or "PR" in documentation and UI. **Do not use "pod"** — it has the wrong connotations.

### Dual possession, single ownership

Both the member and the community hold copies of every post, in perpetuity. Only the member *owns* it in the authorship sense.

This dissolves the obvious tension in pure-SOLID models: if everyone's data leaves with them, threads develop holes when members depart or are excluded. With dual possession, the community's archive remains coherent — the conversations that happened are part of the community's history — while the member's PR remains theirs to take, republish, edit canonically, or carry elsewhere.

The parallel is books and citations: the author owns the work; every reader and library has it in perpetuity. No author has ever recalled a published book from existence. Platforms that imply otherwise are making a category mistake dressed up as UX.

### Implications

- **Edits are forward-going.** Changing your PR copy does not change the community's archive. The community has what you posted; edits are like a revised edition that doesn't retract the original.
- **Deletion from a PR doesn't propagate.** You can stop sharing from your side; the community's copy remains.
- **Exclusion is not collateral.** A member excluded by consensus leaves with their PR intact. Both sides walk away whole, which makes exclusion feel like a parting of ways rather than a punishment.
- **"In perpetuity" is itself anti-engagement.** No rolling-window deletion to drive newness. No ephemeral mode. Conversations stay.

### The "rendered = public" baseline

Once something is rendered on the internet it is public. Screenshots, memory, copy-paste are unsolvable problems. The PR / data-ownership model is about owning the *authoritative copy*, not about retraction or un-publishing. The platform makes no promise that other humans haven't read what you posted.

What handles the human reality of memory and screenshots is **not** the database. It is the precondition (people have already met) and the norms (charity, three strikes, consensus exclusion). The community holds what the database cannot.

The deletion UI should be honest about this. No retraction theatre.

## Open design questions

- Exact mechanism for conferring trusted-participant status (inheritance from offline standing as the default; acclamation by existing trusted members for drift over time — needs concrete UI and flow).
- PR storage model: external SOLID-style PR pointed to by the platform, or platform-internal with clean export? Pure-external is more aligned with the philosophy; internal-with-export is more practical for v1.
- Read access to the community archive: members only? Past members? Discoverable to outsiders? (Probably members-only given the precondition, but worth being explicit.)
- Subject-line norms, threading, search.
- Notification model — must support the take-time norm without driving urgency. No streaks, no badges, no unread-count anxiety.
- Quorum mechanics for exclusion-by-consensus.

## What this is not

- Not a discovery platform. Not a place to meet new people.
- Not engagement-optimised. No FOMO mechanics, no streaks, no public metrics.
- Not retraction theatre. The deletion UI doesn't pretend to do what it cannot.
- Not moderator-led. Moderation power lives in the community, escalating to exclusion by consensus.
- Not a substitute for the real-world relationships it serves.

## Language conventions

- "Personal record" or "PR", not "pod".
- "Trusted participants", not "moderators" or "admins".
- "Exclusion by consensus", not "ban" or "kick".
- "Strike", not "warning" or "infraction".
- "Members", not "users".
- "Posts", not "content".
- Avoid engagement-optimisation vocabulary entirely — no "engagement", "growth", "retention", "stickiness", "virality".