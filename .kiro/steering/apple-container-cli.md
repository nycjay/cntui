# Apple Container CLI Reference (for agent context)

## Binary

The CLI binary is `container` (typically at /usr/local/bin/container).
Installed from: https://github.com/apple/container

## Key Commands Used by ConTUI

### System
- `container system version --format json` — check if service is running + get version
- `container system start --enable-kernel-install` — start the service
- `container system stop` — stop the service
- `container system df --format json` — disk usage

### Containers
- `container list --all --format json` — list all containers
- `container start <id>` — start a stopped container
- `container stop <id>` — gracefully stop a container
- `container delete [--force] <id>` — remove a container
- `container inspect <id>` — detailed JSON info
- `container logs [-n <lines>] <id>` — fetch logs

### Images
- `container image list --format json` — list local images
- `container image pull <ref>` — pull from registry
- `container image delete <ref>` — remove an image
- `container image inspect <ref>` — detailed JSON info

### Volumes
- `container volume list --format json` — list volumes
- `container volume create [-s <size>] <name>` — create a volume
- `container volume delete <name>` — remove a volume
- `container volume inspect <name>` — detailed JSON info

### Machines (v1.0+)
- `container machine list --format json` — list machines
- `container machine stop [<id>]` — stop a machine
- `container machine delete <id>` — remove a machine
- `container machine inspect [<id>]` — detailed JSON info

## Version Requirements

ConTUI requires container CLI v1.0.0 or later. The 1.0 release removed
compatibility with v0 XPC APIs, so clients and servers must both be v1.

On startup, ConTUI checks the CLI version and exits with a clear upgrade
message if the installed version is too old.

## JSON Output

All list commands support `--format json` which returns an array.
All inspect commands return JSON by default (no --format flag needed).

## Error Behavior

- Non-zero exit code on failure
- Error messages go to stderr
- Some commands require the service to be running first
