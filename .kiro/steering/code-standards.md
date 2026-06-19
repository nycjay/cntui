# Code Standards

## TypeScript

- Strict mode enabled (tsconfig strict: true)
- No `any` — use `unknown` and narrow with type guards
- Prefer async/await over raw promises
- Use `type` imports for type-only imports

## Error Handling

- Lib functions throw on failure (caller decides how to handle)
- Views catch errors and display them in-place (red text)
- Never silently swallow errors — at minimum log to stderr

## Testing

- Tests live in tests/ mirroring src/ structure
- Tests must handle both "CLI installed" and "CLI not installed" cases
- Use bun:test (describe, test, expect)
- No mocking framework needed — tests are integration-style against the real CLI
- If CLI is unavailable, test validates the error path instead

## Linting

- Biome handles both linting and formatting
- Run `bun run lint` before committing
- CI will fail on lint errors
- Use `bun run lint:fix` for auto-fixes

## React/OpenTUI Patterns

- One view per file, one export per view
- Views manage their own state (useState + useEffect for initial fetch)
- useInput for keybindings — always document keys in view header
- Refresh functions are async, called on mount and after actions
- Auto-refresh (setInterval) only for the containers view (most dynamic)

## Terminal Escape Codes

- Never use raw escape codes inline — wrap in named helpers (see `src/lib/renderer.ts`)
- Prefer ANSI color names ("red", "cyan") over hex codes where possible
- Hex codes only for colors not available as named ANSI (e.g., background: "#1a1b26")
- All custom colors live in `src/lib/theme.ts` as named constants

## Keyboard Input

- Use `key.name === "g" && key.shift` for uppercase letters (not `key.name === "G"`)
- Use `key.name === "g" && !key.shift` for the lowercase variant when both are handled
- Use `key.ctrl && key.name === "c"` for ctrl combos
- All keybindings must be documented in help-overlay.tsx and status-bar.tsx

## Error Handling in Views

- All `useKeyboard` async handlers must wrap awaited calls in try/catch
- Errors set an `error` state that renders inline (red text with dismiss hint)
- Users dismiss errors with Escape key
- Multi-step actions (e.g., pruneAll) should try/catch around the group so
  partial failures still allow cleanup/refresh

## Dependencies

- Pin all dependency versions exactly (no `^` or `~` ranges)
- Update deps intentionally with `bun update <package>`, never auto-range
- Commit lockfile (`bun.lock`) alongside package.json changes
- Prefer well-known, actively maintained packages
- If a package name looks unusual, verify it before adding

## Git

- Conventional commits: feat:, fix:, docs:, chore:, test:
- Branch from main, PR back to main
- Tag releases as v0.x.y
