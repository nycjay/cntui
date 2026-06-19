import { loadConfig } from "./lib/config.js";
import {
	checkVersionCompatibility,
	getSystemStatus,
	isContainerInstalled,
	startSystem,
} from "./lib/system.js";

import { VERSION } from "./version.js";

if (process.argv.includes("--version") || process.argv.includes("-v")) {
	process.stdout.write(`cntui ${VERSION}\n`);
	process.exit(0);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
	process.stdout.write(`
  cntui v${VERSION}
  A terminal UI for Apple's container runtime

  Usage: cntui [options]

  Options:
    -v, --version  Show version
    -h, --help     Show this help

  Config: ~/.config/cntui/config.toml
\n`);
	process.exit(0);
}

async function main() {
	const { createCliRenderer } = await import("@opentui/core");
	const { createRoot } = await import("@opentui/react");
	const { App } = await import("./app.js");
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

	// Set terminal background before OpenTUI renders
	process.stdout.write("\x1b[48;2;26;27;38m\x1b[2J\x1b[H");

	const { setRenderer } = await import("./lib/renderer.js");
	const renderer = await createCliRenderer({
		openConsoleOnError: false,
		consoleMode: "disabled",
	});
	setRenderer(renderer);
	createRoot(renderer).render(<App config={config} />);
}

main();
