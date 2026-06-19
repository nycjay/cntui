# cntui

A terminal UI for [Apple's container runtime](https://github.com/apple/container). Manage containers, images, volumes, and machines with keyboard-driven navigation.

```
            _         _
  ___ _ __ | |_ _   _(_)
 / __| '_ \| __| | | | |
| (__| | | | |_| |_| | |
 \___|_| |_|\__|\__,_|_|
```

<!-- TODO: Add demo GIF here -->
<!-- ![cntui demo](./docs/demo.gif) -->

## Features

- **Containers** — list, start, stop, delete with live auto-refresh
- **Images** — browse local images, delete unused ones
- **Volumes** — manage persistent storage
- **Machines** — manage container machines (persistent Linux environments, v1.0+)
- **System** — check service status, disk usage, start/stop the daemon
- **Startup validation** — checks CLI is installed, version is compatible, service is running

## Requirements

- macOS with Apple Silicon
- [Apple Container CLI](https://github.com/apple/container/releases) v1.0.0+
- [Bun](https://bun.sh) runtime
- [Zig](https://ziglang.org) (required to build OpenTUI's native rendering core)

## Install

```bash
brew install nycjay/tap/cntui
```

Or from source:

```bash
git clone https://github.com/nycjay/cntui.git
cd cntui
bun install
just build
```

## Usage

```bash
# Start the container service (if not already running)
container system start

# Launch the TUI
bun run dev
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1`–`5` | Switch tabs (Containers, Images, Volumes, Machines, System) |
| `↑` / `↓` | Navigate list |
| `s` | Start/Stop selected item |
| `d` | Delete selected item |
| `r` | Refresh current view |
| `q` | Quit |

## Configuration

cntui reads an optional config file at `~/.config/cntui/config.toml`:

```toml
# How often to poll for container state changes (seconds)
refresh_interval = 3

# Which tab to show on launch
# Options: containers, images, volumes, machines, system
default_tab = "containers"

# Automatically start the container service if it's not running
auto_start_service = false
```

All options are optional — cntui works without a config file.

## Development

Requires [just](https://github.com/casey/just) as a task runner:

```bash
just doctor        # Check your environment
just setup         # Install dependencies
just check         # Run lint + typecheck + tests (same as CI)
just dev           # Run with hot reload
just test-watch    # TDD mode
just test-coverage # Coverage report
just build         # Compile standalone binary
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## Architecture

cntui is a three-layer application:

1. **Application code** (TypeScript + React) — your views, state, keybindings
2. **OpenTUI** (Zig native core) — terminal rendering, layout, input parsing
3. **Apple Container CLI** — spawned as subprocess, JSON output parsed

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details.

## License

MIT
