# ctui development tasks

# Install dependencies
setup:
    bun install

# Run the TUI (auto-restarts on file changes)
dev:
    bun --watch run src/index.tsx

# Run all checks (what CI does)
check: lint typecheck test

# Lint and format check
lint:
    bun run lint

# Auto-fix lint/format issues
fix:
    bun run lint:fix

# Type check
typecheck:
    bun run typecheck

# Run tests
test:
    bun test

# Run tests in watch mode
test-watch:
    bun test --watch

# Run tests with coverage report
test-coverage:
    bun test --coverage

# Run a specific test file
test-file FILE:
    bun test {{FILE}}

# Build standalone binary
build:
    bun build src/index.tsx --compile --outfile ctui

# Clean build artifacts
clean:
    rm -f ctui
    rm -rf node_modules/.cache

# Verify container CLI is set up correctly
doctor:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Checking dependencies..."
    command -v bun >/dev/null && echo "✓ bun $(bun --version)" || echo "✗ bun not found (install: curl -fsSL https://bun.sh/install | bash)"
    command -v zig >/dev/null && echo "✓ zig $(zig version)" || echo "✗ zig not found (install: brew install zig)"
    if command -v container >/dev/null; then
        VER=$(container system version 2>/dev/null | head -2 | tail -1 | awk '{print $2}' || echo "unknown")
        echo "✓ container $VER"
        STATUS=$(container system status >/dev/null 2>&1 && echo "running" || echo "not running")
        echo "  └─ service: $STATUS"
    else
        echo "✗ container not found (install: https://github.com/apple/container/releases)"
    fi

# Tag a release (usage: just release 0.2.0)
release VERSION:
    git tag -a "v{{VERSION}}" -m "Release v{{VERSION}}"
    git push origin "v{{VERSION}}"
