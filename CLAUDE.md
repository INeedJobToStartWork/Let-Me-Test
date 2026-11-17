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

CI (`.github/workflows/ci.yml`) runs `pnpm lint`, `pnpm format`, and `pnpm build:npm`. The Husky pre-commit hook runs `pnpm test`.

## Generators (`turbo/generators/config.ts`)

- **Package**: copies `turbo/generators/templates/packages/test-package-cli/**` to `packages/<dash-case name>`. Handlebars variables include `name`, `description`, `finalScope`, `githubOwner`, `githubRepo`, and `gitAuthorName`.
- **REPO customization**: overwrites root `.github/`, `LICENSE`, and `README.md` from the templates and patches the root `package.json` (`repository`, `bugs`, `homepage`, `author`, `name`). It sets `name` from `answers.name`, but this generator has no `name` prompt.

The template directory is itself listed in `pnpm-workspace.yaml` (`turbo/generators/templates/**`). Root `turbo` tasks therefore also run against the template package, whose `package.json` name is a raw Handlebars string. Template files are Handlebars, so keep `{{ ... }}` placeholders intact when editing them. Changes to the template only affect packages generated afterwards.

## Generated package architecture (the template)

- `src/index.ts`: programmatic API entry. It re-exports `@/functions`.
- `src/bin/app.ts`: CLI entry. It side-effect-imports `@/cli`, where each file registers commands or options on the shared `commander` `program`. Then it calls `program.parse`.
- `src/helpers/`: reusable `commander` `Option`s (`--config`, `--debug`).
- `@/*` resolves to `src/*`. It is set in both `tsconfig.json` and `vitest.config.ts`.
- **Build** uses tsdown via `config/tsdownrc/`. `tsdown.base.ts` defines two configs, `CLI` (bundles `commander`, no dts) and `PACKAGE` (ESM+CJS, dts, copies package.json/README/.npmrc/.npmignore into `dist`). Each is parameterized by a `BuildMode`, and `tsdown.{dev,prod,npm}.ts` pick a mode.
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
