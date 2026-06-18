# ctui

A terminal UI for [Apple's container runtime](https://github.com/apple/container).

Manage containers, images, and volumes with keyboard-driven navigation instead
of memorizing CLI commands.

## Requirements

- macOS with Apple Silicon
- [Bun](https://bun.sh) (runtime)
- [Zig](https://ziglang.org) (required to build OpenTUI's native core)
- [Apple Container CLI](https://github.com/apple/container/releases) installed and service running

## Quick Start

```bash
# Install dependencies
bun install

# Start the container service (if not already running)
container system start

# Run the TUI
bun run dev
```

## Usage

| Key | Action |
|-----|--------|
| `1` | Containers tab |
| `2` | Images tab |
| `3` | Volumes tab |
| `4` | System tab |
| `↑/↓` | Navigate list |
| `s` | Start/Stop selected item |
| `d` | Delete selected item |
| `r` | Refresh current view |
| `q` | Quit |

## Development

```bash
bun test          # Run tests
bun run lint      # Check lint + formatting
bun run lint:fix  # Auto-fix
bun run typecheck # Type checking
bun run build     # Compile to standalone binary
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed explanation of the
three-layer design (application code → OpenTUI framework → container CLI).

## License

MIT
