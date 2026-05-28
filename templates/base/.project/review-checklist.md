# Review Checklist

Use this checklist before a non-trivial batch is accepted.

## Architecture

- Is the change consistent with `.project/architecture.md` and `.project/constraints.md`?
- Did the change avoid introducing unnecessary abstractions or cross-module coupling?

## Contracts And Behavior

- Does the change match the relevant feature brief and any explicit contracts?
- Are edge cases and failure behavior explicit enough?

## Security

- Check untrusted input handling, authentication and authorization, secrets, command execution, path handling, and external calls.

## Design Fidelity

- If `.project/design/` exists, does the UI match the mockups and annotations without invented behavior or layout?
- Are any ambiguities called out as assumptions?

## Tests

- Are high-risk behaviors protected by tests when appropriate?
- If tests were omitted, is the reason defensible?

## Maintainability

- Is the diff small enough to review?
- Are docs and changelog updated where durable context changed?
