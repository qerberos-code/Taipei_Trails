# Ticket Schema

Use this schema for every generated ticket.

```md
# <TICKET-ID>: <Title>

## Goal
Describe one concrete outcome in user/system terms.

## Source Contracts
- Link or cite the exact specs, features, contracts, BDD scenarios, code, schemas, or tests that govern this ticket.

## Prerequisite State
State what must already be true before starting. Describe completed capability/state, not a same-batch dependency.

## Scope
Included:
- ...

Excluded:
- ...

## Boundaries
Owns:
- Files, modules, APIs, behavior, or docs this ticket may change.

Does Not Own:
- Adjacent behavior intentionally left out.

## Implementation Notes
Describe the intended approach, interfaces, data flow, state changes, and failure handling. Keep this decision-complete but avoid over-specifying unrelated internals.

## Definition of Done
- Concrete completion criteria. These should be true before the ticket can be marked done.

## How to Eval
- Exact commands, checks, manual scenarios, fixture inputs, expected outputs, or review procedure.

## Acceptance Checklist
- [ ] Observable behavior is implemented.
- [ ] Required persisted state or side effects are implemented.
- [ ] Public interfaces/contracts are updated if applicable.
- [ ] Tests cover the named scenarios.
- [ ] Persistent docs are updated.

## Forbidden Side Effects
- Behaviors this ticket must not introduce.
- External calls this ticket must not make.
- Data this ticket must not read/write.

## Test Plan
- Unit tests:
- Integration/workflow tests:
- Manual smoke checks:

## Persistent Doc Updates
- Durable docs to update after implementation, or `None`.

## Handoff Notes
What the next ticket can rely on after this ticket is done.
```

## Splitting Heuristics

- Split by observable behavior first, layer second.
- Keep auth/permission gates separate from business workflows.
- Keep persistence contract tickets separate from real adapter tickets when the adapter requires more setup.
- Keep fake harness tickets separate when they unlock multiple later tickets.
- Merge tickets when each one is meaningless without the other in the same implementation pass.

## Independence Test

Before finalizing a ticket, answer yes to all:

- Can a reviewer verify this ticket without also reviewing another in-progress ticket?
- Can the ticket be reverted without breaking an unrelated completed feature?
- Does the ticket have its own DoD and eval path?
- Does it specify prerequisite state rather than same-batch dependency?
- Are all forbidden side effects explicit where risk is high?
