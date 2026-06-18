import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./app.js";
import {
	checkVersionCompatibility,
	getSystemStatus,
	isContainerInstalled,
} from "./lib/system.js";

async function main() {
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
		console.error(
			"Container service is not running. Start it with: container system start",
		);
		process.exit(1);
	}

	const renderer = await createCliRenderer();
	createRoot(renderer).render(<App />);
}

main();
