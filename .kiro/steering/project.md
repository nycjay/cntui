# cntui Project Steering

## What This Is

A terminal UI (TUI) for Apple's container runtime, built with OpenTUI (Zig
rendering core) and React/TypeScript on Bun.

## Tech Stack

- Runtime: Bun
- TUI framework: OpenTUI (@opentui/core + @opentui/react)
- Language: TypeScript with React JSX
- Testing: bun test
- Linting/Formatting: Biome
- CI: GitHub Actions (macos-latest runner)

## Conventions

- Tabs for indentation (Biome default)
- All CLI interaction goes through src/lib/ — views never call Bun.spawn directly
- JSON output from the container CLI is the only data source (--format json)
- Types in src/types/ must match CLI JSON output exactly
- Views are self-contained React components with their own state + refresh logic
- Keyboard shortcuts shown in status bar and view headers
- Tests should pass whether or not the container CLI is installed

## Commands

- `just setup` — install dependencies
- `just dev` — run the TUI
- `just check` — run lint + typecheck + test (same as CI)
- `just lint` — check lint/formatting
- `just fix` — auto-fix lint/formatting
- `just typecheck` — TypeScript type checking
- `just test` — run all tests
- `just test-file tests/lib/version.test.ts` — run a single test file
- `just build` — compile to standalone binary
- `just doctor` — verify all dependencies are installed and working
- `just clean` — remove build artifacts
- `just release 1.0.0` — tag and push a release

Also available as npm scripts (`bun run dev`, `bun test`, etc.) if you prefer.

## Adding Dependencies

When adding a new dependency:
1. `bun add <package>` (or `bun add -d` for dev)
2. Immediately pin to exact version in package.json (remove `^`/`~`)
3. Verify the package is legitimate (check npm page, GitHub stars, maintainers)
4. Commit both package.json and bun.lock together

## File Naming

- Views: `src/views/<name>.tsx` (one per tab)
- Lib modules: `src/lib/<name>.ts` (one per resource type)
- Tests mirror src: `tests/lib/<name>.test.ts`
- Components: `src/components/<name>.tsx`

## Adding a New View

1. Create `src/views/<name>.tsx` with a React component
2. Add corresponding lib module in `src/lib/<name>.ts`
3. Add types in `src/types/container.ts`
4. Register the tab in `src/app.tsx` (TABS array + conditional render)
5. Add a test in `tests/lib/<name>.test.ts`

## Adding a New Action to an Existing View

1. Add the lib function in the appropriate `src/lib/<name>.ts`
2. Wire it to a keybinding in the view's `useInput` handler
3. Document the key in the view's header text and in status-bar.tsx
