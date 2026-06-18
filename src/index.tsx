import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./app.js";
import { loadConfig } from "./lib/config.js";
import {
	checkVersionCompatibility,
	getSystemStatus,
	isContainerInstalled,
	startSystem,
} from "./lib/system.js";

const VERSION = "0.1.0";

if (process.argv.includes("--version") || process.argv.includes("-v")) {
	console.log(`cntui ${VERSION}`);
	process.exit(0);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
	console.log(`
  ┌─────────────────────────────┐
  │  ╭───╮                      │
  │  │ ▶ │  cntui v${VERSION}         │
  │  ╰───╯                      │
  └─────────────────────────────┘
  A terminal UI for Apple's container runtime

  Usage: cntui [options]

  Options:
    -v, --version  Show version
    -h, --help     Show this help

  Config: ~/.config/cntui/config.toml
`);
	process.exit(0);
}

async function main() {
	const config = loadConfig();

	const installed = await isContainerInstalled();
	if (!installed) {
		console.error(
			"Error: 'container' CLI not found. Install it from https://github.com/apple/container",
		);
		process.exit(1);
	}

	const status = await getSystemStatus();

	const versionCheck = checkVersionCompatibility(status.version);
	if (!versionCheck.ok) {
		console.error(`Warning: ${versionCheck.message}`);
		process.exit(1);
	}

	if (!status.running) {
		if (config.auto_start_service) {
			console.error("Container service not running. Starting...");
			await startSystem();
		} else {
			console.error(
				"Container service is not running. Start it with: container system start",
			);
			console.error(
				"Or set auto_start_service = true in ~/.config/cntui/config.toml",
			);
			process.exit(1);
		}
	}

	const renderer = await createCliRenderer({ backgroundColor: "transparent" });
	createRoot(renderer).render(<App config={config} />);
}

main();
