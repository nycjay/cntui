# Contributing to ctui

Thanks for your interest in contributing! This document covers the development
workflow and standards.

## Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/ctui.git
cd ctui
just doctor   # verify dependencies
just setup    # install packages
just check    # run full CI locally
```

### Requirements

- [Bun](https://bun.sh) 1.2+
- [Zig](https://ziglang.org) 0.14+ (for OpenTUI native core)
- [just](https://github.com/casey/just) (task runner)
- [Apple Container CLI](https://github.com/apple/container) 1.0+ (for integration tests)

## Development Workflow

1. Create a branch from `main`
2. Make your changes
3. Run `just check` (lint, typecheck, tests must all pass)
4. Commit with a conventional commit message
5. Open a PR against `main`

### Useful Commands

| Command | What it does |
|---------|--------------|
| `just dev` | Run with hot reload |
| `just test-watch` | Re-run tests on file changes |
| `just test-coverage` | Show test coverage |
| `just lint` | Check formatting + lint |
| `just fix` | Auto-fix formatting |

## Code Standards

### TypeScript

- Strict mode — no `any`, use `unknown` and type guards
- Async/await over raw promises
- Tabs for indentation (enforced by Biome)

### Project Structure

```
src/
├── lib/          # CLI interaction — no UI code here
├── types/        # TypeScript interfaces for CLI JSON output
├── views/        # One React component per tab
├── components/   # Reusable UI pieces
├── app.tsx       # Tab router
└── index.tsx     # Entry point + system validation
tests/
└── lib/          # Tests mirror src/lib/
```

### Adding a Feature

**New view/tab:**
1. Add lib module: `src/lib/<name>.ts`
2. Add view: `src/views/<name>.tsx`
3. Register in `src/app.tsx` (TABS array + render)
4. Add test: `tests/lib/<name>.test.ts`

**New action on existing view:**
1. Add function to appropriate `src/lib/<name>.ts`
2. Wire keybinding in the view's `useKeyboard` handler
3. Document the key in the view header text and `src/components/status-bar.tsx`

### Testing

- Tests must pass whether or not the container CLI is installed
- Test the lib layer (data parsing, error handling)
- Use `bun:test` (describe, test, expect)
- Run `just test-coverage` to check what's covered

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add network management view
fix: handle empty container list without crash
docs: update README with config options
chore: update dependencies
test: add coverage for volume deletion
```

## Releasing

Releases are automated via GitHub Actions. To release:

```bash
just release 0.2.0   # tags and pushes, triggers build + GH release
```

The CI builds a standalone macOS binary and attaches it to the GitHub release.

## Questions?

Open an issue or start a discussion on GitHub.
