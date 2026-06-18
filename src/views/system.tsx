import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import {
	getDiskUsage,
	getSystemStatus,
	startSystem,
	stopSystem,
} from "../lib/system.js";
import type { DiskUsage, SystemStatus } from "../types/container.js";

const bold = createTextAttributes({ bold: true });

export function SystemView() {
	const [status, setStatus] = useState<SystemStatus | null>(null);
	const [diskUsage, setDiskUsage] = useState<DiskUsage[]>([]);

	const refresh = async () => {
		setStatus(await getSystemStatus());
		try {
			setDiskUsage(await getDiskUsage());
		} catch {
			setDiskUsage([]);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
	useEffect(() => {
		refresh();
	}, []);

	useKeyboard(async (key) => {
		if (key.name === "s") {
			if (status?.running) await stopSystem();
			else await startSystem();
			await refresh();
		}
		if (key.name === "r") await refresh();
	});

	const serviceColor = status?.running ? "green" : "red";
	const serviceText = status?.running ? "Running" : "Stopped";

	return (
		<box flexDirection="column">
			<text
				attributes={bold}
				content="System — [s] start/stop service [r] refresh"
			/>
			<text fg={serviceColor} content={`Service: ${serviceText}`} />
			{status?.version && <text content={`Version: ${status.version}`} />}
			{status?.commit && <text content={`Commit: ${status.commit}`} />}
			{diskUsage.length > 0 && (
				<box flexDirection="column" marginTop={1}>
					<text attributes={bold} content="Disk Usage" />
					<text
						attributes={bold}
						content={`  ${"TYPE".padEnd(16)} ${"TOTAL".padEnd(8)} ${"ACTIVE".padEnd(8)} ${"SIZE".padEnd(12)} RECLAIMABLE`}
					/>
					{diskUsage.map((d) => (
						<text
							key={d.type}
							content={`  ${d.type.padEnd(16)} ${String(d.total).padEnd(8)} ${String(d.active).padEnd(8)} ${d.size.padEnd(12)} ${d.reclaimable}`}
						/>
					))}
				</box>
			)}
		</box>
	);
}
