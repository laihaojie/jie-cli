# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@djie/cli` (also known as `ajie-cli`) is a personal Node.js CLI tool built with TypeScript and [commander.js](https://github.com/tj/commander.js/). It provides utilities for project scaffolding, image conversion, Git operations, file searching, ZIP compression, and more.

## Development Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Run the CLI in development mode via `esno index.ts` |
| `pnpm bridge` | Run the bridge HTTP server directly via `esno src/bridge.ts` |
| `pnpm build` | Production build using `tsdown` (outputs to `dist/`) |
| `pnpm lint` / `pnpm lint:fix` | Run ESLint with `@djie/eslint-config` |
| `pnpm release` | Bump patch version, commit, tag, and push |

**Note:** There is no test suite in this project. Do not invent test commands.

## Build System

- **Primary bundler:** `tsdown` (replaced `tsup`, `unbuild`, and `tsc`)
- **Config:** `tsdown.config.ts`
- **Entries:** `index.ts` (CLI), `src/bridge.ts` (HTTP server), `src/check.ts` (version check)
- **Output formats:** `cjs` and `esm` with `.d.ts` declarations
- **Entry binary:** `bin/jie.cjs` requires `../dist/jie.cjs`

The legacy configs (`tsup.config.ts`, `build.config.ts`) remain in the repo but are no longer used in the default build.

## High-Level Architecture

### Three-Layer Entry Structure

```
bin/jie.cjs   →   dist/jie.cjs   →   index.ts   →   src/index.ts
    (shebang)        (bundled)         (timing)       (CLI logic)
```

- `bin/jie.cjs` is the published binary; it only `require`s the bundled output.
- `index.ts` adds an `exit` timer and then calls `main()` from `src/index.ts`.
- `src/index.ts` registers all commands with `commander`, starts the background bridge server, and parses `process.argv`.

### Command Registration Pattern

All commands are registered inline in `src/index.ts` using `program.command(...).action(...)`. Each command imports its implementation from `src/commands/<name>.ts`. When adding a new command, follow this pattern: create a module under `src/commands/`, export the action function, and wire it up in `src/index.ts`.

### Background Bridge Server (`src/bridge.ts`)

On every CLI invocation, `startServer()` (in `src/commands/server.ts`) attempts to spawn `src/bridge.ts` as a detached background process listening on `http://127.0.0.1:32677`. The server exposes a simple HTTP POST API that accepts `{ cmd, shell?, cwd? }` and returns the command output plus the resulting working directory. This is used by external tools (e.g., a web UI) to execute shell commands through the CLI.

### Shell Execution Abstraction (`src/utils/run.ts`)

All shell invocations go through `run.ts`:
- `runCmdSync` — executes with `stdio: 'inherit'`
- `runCmdGetRes` — executes with `stdio: 'pipe'` and returns the string output
- `runCmd` — spawns asynchronously with `stdio: 'pipe'`

On Windows, these utilities prefer Git Bash (`globalThis.__GIT_BASH`) if available, falling back to the default shell. Output is decoded with `iconv-lite` to handle encoding issues.

### Project Scaffolding (`src/commands/create.ts`)

The `create` command uses `degit` to clone templates from GitHub. Templates are defined in the `createMeta` object. Adding a new template only requires adding an entry there with a `templateUrl` and optional `prompt`/`effect` hooks.

### Local State

Runtime state (e.g., cached latest version) is stored in `~/.jie/`, managed by `src/utils/store.ts`.

## Code Style

- ESLint config extends `@djie/eslint-config` with `no-console: 'off'`.
- TypeScript strict mode is enabled, but `strictNullChecks`, `strictBindCallApply`, `noImplicitAny`, and `forceConsistentCasingInFileNames` are disabled.
- Target is ES2017, module output is CommonJS.
