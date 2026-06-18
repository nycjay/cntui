# ConTUI Architecture

## Overview

ConTUI is a terminal user interface for Apple's container runtime. It provides a
visual, interactive way to manage containers, images, and volumes that would
otherwise require memorizing CLI commands.

## Layer Diagram

```
┌──────────────────────────────────────────────────┐
│  ConTUI Application Code (TypeScript + React)     │
│  You write this. Views, state, keybindings.      │
├──────────────────────────────────────────────────┤
│  OpenTUI Framework (Zig core + React reconciler) │
│  Handles rendering, layout, input. You don't     │
│  modify this — it's a dependency.                │
├──────────────────────────────────────────────────┤
│  Apple Container CLI (external binary)           │
│  Spawned as child processes. JSON output parsed. │
└──────────────────────────────────────────────────┘
```

## What Each Layer Does

### Application Code (src/)

- **Views** (`src/views/`): React components for each tab (containers, images,
  volumes, system). They manage their own state, handle keyboard input for
  actions, and call the lib layer.
- **Lib** (`src/lib/`): Thin wrappers around `Bun.spawn()` that execute
  `container` CLI commands and parse JSON output. No rendering logic here.
- **Types** (`src/types/`): TypeScript interfaces matching the JSON output
  structure of the `container` CLI.
- **Components** (`src/components/`): Reusable UI primitives (status bar, etc.)

### OpenTUI (dependency)

The Zig native core handles:
- **Terminal rendering**: Writes ANSI escape codes to stdout efficiently
- **Layout engine**: Flexbox-like positioning (width, height, padding, borders)
- **Input handling**: Parses raw terminal input (arrow keys, ctrl sequences)
- **Text processing**: UTF-8 width calculation, word wrapping
- **Diffing**: Only redraws changed regions (no flicker)

The React reconciler (`@opentui/react`) bridges React's virtual DOM to the Zig
renderer. When your component state changes, React calculates the diff, and
OpenTUI renders only what changed.

You interact with this layer through:
- `<Box>` — layout container (like a div)
- `<Text>` — text content with color/bold/dim
- `useInput()` — keyboard event hook

### Apple Container CLI (external)

The `container` binary is Apple's official tool. We never link to it or import
it — we spawn it as a subprocess:

```typescript
Bun.spawn(["container", "list", "--all", "--format", "json"])
```

Key commands we use:
- `container list --all --format json` — list containers
- `container image list --format json` — list images
- `container volume list --format json` — list volumes
- `container system version --format json` — check service status
- `container start/stop/delete <id>` — lifecycle actions

## Data Flow

1. User presses a key (e.g., `s` to stop a container)
2. OpenTUI's input parser detects the keypress
3. React's `useInput` hook fires in the active view component
4. View calls `stopContainer(id)` from `src/lib/containers.ts`
5. Lib function spawns `container stop <id>` via Bun.spawn
6. On success, view calls `refresh()` which re-fetches the list
7. React state updates → reconciler diffs → Zig core redraws

## Directory Structure

```
contui/
├── src/
│   ├── index.tsx          # Entry point, system validation
│   ├── app.tsx            # Tab router
│   ├── views/             # One file per tab
│   ├── components/        # Reusable UI pieces
│   ├── lib/               # CLI interaction (no UI)
│   └── types/             # TypeScript interfaces
├── tests/                 # Unit tests (bun test)
├── .github/workflows/     # CI + release automation
├── biome.json             # Linter/formatter config
├── package.json
└── tsconfig.json
```

## Why This Architecture

- **Separation of concerns**: Lib layer is testable without a terminal. Views
  are purely about presentation and interaction.
- **CLI as backend**: No need to reverse-engineer Apple's internal APIs. The CLI
  is the stable interface. JSON output is machine-friendly.
- **React model**: Declarative UI. Describe what the screen should look like
  given current state; let the framework handle transitions.
- **Zig performance**: Terminal rendering is surprisingly CPU-intensive at scale.
  The native core keeps things smooth even with rapid updates.
