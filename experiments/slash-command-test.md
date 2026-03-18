# Experiment 01: /greet slash command + test generation

## Prompt used

Create a Rocket.Chat slash command called /greet that replies "Hello!" to the user who ran it. Also generate the matching Jest test file with proper mocks for the Apps-Engine accessors.

## Generated test highlights (latest version)

- Uses app user via `read.getUserReader().getAppUser()`
- Asserts `setSender(appUser)`
- Fallback test when app user is undefined
- Always checks `finish(messageBuilder)`

## npm test result

PASS tests/GreetCommand.test.ts (3 tests passed)

## Files

- Before (earlier version): basic mocks, no app user
- After: app user + fallback test added

(To be updated with before/after code diffs and screenshots)

---

# Experiment 02: /echo command + persistence + advanced test generation

## Prompt used

Create a Rocket.Chat slash command called /echo that repeats the user’s arguments (e.g. /echo hi → "You said: hi"), ignores bot senders, stores the echo count per user using persistence, and generates a comprehensive Jest test file covering happy path, bot ignore, persistence calls, and app user sender.

## Generated test highlights

- Handles arguments correctly (`args.join`)
- Ignores bot messages
- Uses persistence (`read.getPersistenceReader`, `updateByAssociation`)
- Tracks user-specific data (association by user)
- Uses app user via `getAppUser()`
- Includes fallback when app user is unavailable
- Ensures `.finish()` is always called
- Covers multiple test scenarios (not just basic flow)

## npm test result

PASS tests/EchoCommand.test.ts (6 tests passed)

## Files

- Command: `commands/EchoCommand.ts`
- Test: `tests/EchoCommand.test.ts`

## Key difference from Experiment 01

- Moves beyond simple message sending
- Introduces persistence logic
- Adds multi-scenario test coverage
- Validates more realistic Rocket.Chat app behavior

(To be updated with screenshots and test snippets)
