---
name: rc-test-generator
description:
  Automatically generates realistic Jest .test.ts files for Rocket.Chat Apps,
  focusing on correct mocking of Apps-Engine accessors (IRead, IModify, IHttp,
  IPersistence) and common silent runtime bug preventers
---

When the user request includes creating a Rocket.Chat App (or part like slash
command, listener) **AND** mentions tests / testing / generate test / unit test
/ .test.ts / jest:

1. ALWAYS generate a matching `.test.ts` file in the `tests/` folder (same base
   name + `.test.ts`). Example: `commands/StandupCommand.ts` →
   `tests/StandupCommand.test.ts`

2. Use **Jest** (describe, it, expect, beforeEach, jest.fn / jest.Mocked).

3. Import only real RC definition paths:
   ```ts
   import {
     ISlashCommand,
     SlashCommandContext,
   } from '@rocket.chat/apps-engine/definition/slashcommands';
   import {
     IRead,
     IModify,
     IHttp,
     IPersistence,
   } from '@rocket.chat/apps-engine/definition/accessors';
   ```
