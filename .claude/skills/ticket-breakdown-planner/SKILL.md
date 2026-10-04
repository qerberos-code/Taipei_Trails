---
name: ticket-breakdown-planner
description: Break broad specs, feature docs, tech stack notes, BDD scenarios, contracts, implementation plans, or architecture documents into small AI-executable tickets. Use when Codex needs to turn high-level product/technical scope into independently verifiable tickets with boundaries, prerequisite state, Definition of Done, eval instructions, acceptance checks, forbidden side effects, test plans, and persistent documentation updates.
---

# Ticket Breakdown Planner

Use this skill to convert broad planning material into implementation tickets that another AI agent or engineer can execute safely.

Core rule: tickets may have order, but must not require same-batch implementation with another ticket. If two tickets must be done together for either one to be valid, merge them or carve out a smaller foundation ticket first.

## Workflow

1. Ground in source truth before drafting tickets.
   - Read the relevant `contracts`, `features`, `spec`, BDD files, tech-stack docs, existing code, tests, schemas, and prior task lists.
   - Identify current implementation state, not only desired behavior.
   - Preserve exact contract language for hard requirements, especially auth, data ownership, side effects, and forbidden behavior.

2. Extract implementation slices.
   - List user-visible behaviors, system side effects, forbidden side effects, external integrations, state transitions, and validation surfaces.
   - Prefer vertical slices with one observable outcome.
   - Use foundation tickets only when they create a stable contract needed by later independent tickets.

3. Split tickets with the independence test.
   - Each ticket must be reviewable alone.
   - Each ticket may name prerequisite state, but must not say "implement this together with ticket X".
   - If a ticket depends on another ticket's code, describe the required completed state, not the other ticket as a co-owned work item.
   - Avoid broad layer-only tickets unless the layer itself is the deliverable contract.

4. Write every ticket with eval built in.
   - Include Definition of Done, How to Eval, Acceptance Checklist, Forbidden Side Effects, and Test Plan.
   - Tie every acceptance item to observable behavior, persisted state, public interface, or automated/manual test.
   - Include persistent documentation updates when implementation changes durable behavior or contracts.

5. Produce an index.
   - Include ID, title, status, prerequisite state, validation surface, and source coverage.
   - Sequence tickets in recommended execution order without making them same-batch dependent.

## Ticket Quality Bar

A good ticket:

- has exactly one main outcome;
- states included and excluded scope;
- names the files/modules/APIs only where needed to remove ambiguity;
- tells the implementer what not to do;
- can be evaluated without reading every source doc again;
- can fail review with concrete evidence;
- leaves handoff notes for the next ticket.

Reject or rewrite a ticket if:

- it requires another ticket to be implemented in the same change;
- it mixes unrelated behavior such as auth, order creation, and admin UI;
- it says "update tests" without naming scenarios;
- it has no forbidden side effects for high-risk workflow gates;
- it lacks persistent documentation duties for contract changes.

## Output Format

Use one Markdown file per ticket plus an index when writing artifacts. When only planning in chat, present the same structure.

Read `references/ticket-schema.md` for the exact ticket template and field definitions.

## Defaults

- Prefer Markdown tickets.
- Use IDs like `<DOMAIN>-<AREA>-001`, for example `BOT1-AUTH-001`.
- Use `Prerequisite State` instead of `Dependencies` to allow sequencing without encouraging coupled tickets.
- Mark status as `draft`, `ready`, `doing`, `blocked`, or `done`.
- Keep each ticket small enough for one focused implementation pass plus tests.
