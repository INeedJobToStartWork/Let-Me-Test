# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A pnpm + Turborepo monorepo **starter/template** for publishing TypeScript npm packages that ship both a CLI and a programmatic API. There are currently no real packages yet: `apps/`, `packages/`, and `benchmarks/` are workspace globs that don't exist. New packages are scaffolded with Turbo generators. `website` is an empty gitlink (submodule commit with no `.gitmodules`).

Requirements: Node `>=26` (`.nvmrc`), pnpm 12 (`packageManager`).

## Commands

Root scripts mostly fan out through `turbo <task>` to every workspace package:

```sh
pnpm install
pnpm build:dev        # turbo watch, tsdown dev config (ESM only)
pnpm build:prod       # depends on upstream format + lint:fix + lint
pnpm build:npm        # what CI runs: clean-package prepack -> tsdown npm config (attw + publint) -> postpack
pnpm lint             # eslint .
pnpm lint:fix
pnpm format           # prettier --write then --check
pnpm test             # vitest (turbo task is persistent)
pnpm test:coverage
pnpm turbo gen        # run a generator (see below)
```

To run a single package or test, work inside the package:

```sh
pnpm --filter <package-name> test
cd packages/<pkg> && pnpm exec vitest run src/functions/myFunction.test.ts
```

Package `test` scripts run `vitest test`. The `test` there is a file-name filter, not a subcommand, and vitest stays in watch mode in a TTY. Use `vitest run <path>` for one-shot runs.

CI (`.github/workflows/ci.yml`) runs `pnpm lint`, `pnpm format`, and `pnpm build:npm --filter='!./turbo/generators/templates/**'`. The template is excluded because packing (attw/publint) fails on its Handlebars package name. To check a template change end to end, generate a throwaway package (`pnpm turbo gen Package --args <name> <desc> <scope> <owner> <repo> <author>`), then `pnpm install`, `pnpm build:npm` in it, run `dist/bin/app.mjs`, and delete it.

Husky hooks:
- **pre-commit** runs `lint-staged`. Each package has a `lint-staged.config.js` that runs `eslint --fix` and `prettier --write` on staged files. Commands are pinned to the package dir via `pnpm --dir`, because lint-staged runs tasks from the repo root when only one config exists.
- **pre-push** runs `turbo run lint`, `turbo run format:check` (check-only, no writes), and `turbo run test -- --run`.

Packages use TypeScript 7, but typescript-eslint doesn't support it (TS 7 has no JS compiler API). `packageExtensions` in `pnpm-workspace.yaml` gives `@ineedj/eslintrc` its own TS 6 plus `@typescript-eslint/parser`, so the whole eslint tree resolves TS 6 while builds stay on TS 7. Because TS 6+ defaults `types` to `[]`, the template tsconfig sets `"types": ["node"]`.

`.gitattributes` forces LF line endings. Without it, `core.autocrlf=true` on Windows checks files out as CRLF and every file fails `prettier --check`.

## Generators (`turbo/generators/config.ts`)

- **Package**: copies `turbo/generators/templates/packages/test-package-cli/**` to `packages/<dash-case name>`. Handlebars variables include `name`, `description`, `finalScope`, `githubOwner`, `githubRepo`, and `gitAuthorName`.
- **REPO customization**: overwrites root `.github/`, `LICENSE`, and `README.md` from the templates and patches the root `package.json` (`repository`, `bugs`, `homepage`, `author`, `name`). It sets `name` from `answers.name`, but this generator has no `name` prompt.

The template directory is itself listed in `pnpm-workspace.yaml` (`turbo/generators/templates/**`). Root `turbo` tasks therefore also run against the template package, whose `package.json` name is a raw Handlebars string. Template files are Handlebars, so keep `{{ ... }}` placeholders intact when editing them. Changes to the template only affect packages generated afterwards.

## Generated package architecture (the template)

- `src/index.ts`: programmatic API entry. It re-exports `@/functions`.
- `src/bin/app.ts`: CLI entry. It side-effect-imports `@/cli`, where each file registers commands or options on the shared `commander` `program`. Then it calls `program.parse`.
- `src/helpers/`: reusable `commander` `Option`s (`--config`, `--debug`).
- `@/*` resolves to `src/*`. It is set in both `tsconfig.json` and `vitest.config.ts`.
- **Build** uses tsdown via `config/tsdownrc/`. `tsdown.base.ts` defines two configs, `CLI` (bundles `commander`, no dts) and `PACKAGE` (ESM+CJS, dts, copies package.json/README/.npmrc/.npmignore into `dist`). Each is parameterized by a `BuildMode`, and `tsdown.{dev,prod,npm}.ts` pick a mode. Gotchas:
  - tsdown resolves relative paths from the config dir (`config/tsdownrc`), so `entry`, `outDir`, and `copy` are built from `process.cwd()`.
  - Use tsdown's `copy` option, not a copy plugin. A plugin runs once per format in parallel and races on `dist/package.json` (EBUSY on Windows).
  - `src/cli/index.ts` must use side-effect imports (`import "./version"`), not `export *`. During `build:npm`, clean-package swaps in `"type": "commonjs"`, and rolldown then drops `export *` of modules that have no exports, so the CLI ends up with no commands.
- **Publishing**: `publishConfig.directory` is `dist`. `clean-package.config.json` rewrites `package.json` at pack time: it adds the scope, `exports`/`main`/`module`, swaps the dev bin `<name>-dev` for `<name>`, and strips dependencies. `npm:postpack` restores the original file.
- Shared configs come from external `@ineedj/eslintrc`, `@ineedj/prettierrc`, and `@ineedj/tsconfig`. `configs/vitest` (`@configs/vitest`) is a local shared vitest config factory using jsdom and v8 coverage. The template lists it as a dependency but currently uses its own `vitest.config.ts`.

## Code conventions (from the template)

- Tabs for indentation, per the `@ineedj/prettierrc` config.
- Files are split into sections with comment separators such as `//----------------------` followed by `// Types`, `// Functions`, `// CLI APP`, or `// Tests`.
- Non-public items are tagged `/** @internal */`. They are stripped from declarations by `stripInternal`.
- Tests sit next to the code as `*.test.ts`, grouped as `describe(fn, () => describe("[PASS]", ...))`.

## Commits and releases

- Commits are made with `commitsmile` (`commitSmile.ts`). Format: emoji + type + scope, e.g. `⚙️  Chore(generators): ...` or `🐛 Fix(scope): ...`. Scopes are workspace names plus `environment`. Use `!` for breaking changes.
- Releases use Changesets. Add a changeset (`pnpm changeset`) for package changes. On `main`, `publish.yml` opens a version PR or publishes to npm.
