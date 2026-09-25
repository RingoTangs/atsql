# Repository Guidelines

## Project Structure & Module Organization

This repository is a small ESM TypeScript package built with `tsdown`. Source code lives in `src/`, and `src/index.ts` is the public entry point. Keep helpers focused and colocated under `src/`; place tests beside the code they cover. Shared or ambient declarations may live in `types/`. Build artifacts are generated in `dist/` and should not be edited directly. Use the `@` alias for imports from `src/` when it improves clarity, such as `@/utils`.

## Build, Test, and Development Commands

Use pnpm with Node.js `22.23.2`; published packages support Node.js `>=22`.

- `pnpm dev`: build unminified CJS/ESM bundles and declarations.
- `pnpm build`: create minified production bundles in `dist/`.
- `pnpm test`: run Vitest in watch mode.
- `pnpm test:run`: run tests once for CI-style verification.
- `pnpm lint`: check code with ESLint.
- `pnpm format`: verify Prettier formatting.
- `pnpm typecheck`: run TypeScript project-reference checks.
- `pnpm check`: run linting, formatting, type checks, and tests.
- `pnpm check:fix`: apply ESLint and Prettier fixes.
- `pnpm pack:check`: preview files included in the npm package.

Do not invoke `prepublishOnly` directly; npm runs it automatically before publishing.

## Coding Style & Naming Conventions

Write ESM TypeScript and prefer named exports for public APIs. Use camelCase for variables and functions, PascalCase for types and classes, and kebab-case for non-code filenames where practical. Prettier controls formatting, while ESLint uses `@antfu/eslint-config`. Run `pnpm check:fix` before committing routine style changes.

## Testing Guidelines

Vitest is the test framework. Name tests `*.test.ts` or `*.spec.ts`, for example `src/utils/format.test.ts`. Prefer fast unit tests that exercise exported behavior. Run `pnpm test:run` before opening a pull request. No explicit coverage threshold is currently defined.

## Commit & Pull Request Guidelines

Use short, imperative Conventional Commit messages, such as `fix: handle empty input` or `feat: add query parser`. Keep pull requests limited to one logical change. Include a concise description, relevant issue links, and the checks performed. Add screenshots only for generated documentation or other visual changes.

## Agent-Specific Instructions

Do not modify `pnpm-lock.yaml` unless dependencies change. Avoid committing generated `dist/` output unless project policy changes. Prefer existing scripts and configuration over introducing new tooling.
