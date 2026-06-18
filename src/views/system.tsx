import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import {
	getDiskUsage,
	getSystemStatus,
	startSystem,
	stopSystem,
} from "../lib/system.js";
import { col } from "../lib/table.js";
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

	return (
		<box flexDirection="column">
			<text
				fg="#cdd6f4"
				attributes={bold}
				content="System — [s] start/stop service [r] refresh"
			/>
			<text
				fg={status?.running ? "#a6e3a1" : "#f38ba8"}
				content={`Service: ${status?.running ? "Running" : "Stopped"}`}
			/>
			{status?.version && (
				<text fg="#cdd6f4" content={`Version: ${status.version}`} />
			)}
			{status?.commit && (
				<text fg="#6c7086" content={`Commit: ${status.commit}`} />
			)}
			{diskUsage.length > 0 && (
				<box flexDirection="column" marginTop={1}>
					<text fg="#cdd6f4" attributes={bold} content="Disk Usage" />
					<text
						fg="#6c7086"
						attributes={bold}
						content={`  ${col("TYPE", 14)} ${col("TOTAL", 8)} ${col("ACTIVE", 8)} ${col("SIZE", 12)} RECLAIMABLE`}
					/>
					{diskUsage.map((d) => (
						<text
							key={d.type}
							fg="#cdd6f4"
							content={`  ${col(d.type, 14)} ${col(String(d.total), 8)} ${col(String(d.active), 8)} ${col(d.size, 12)} ${d.reclaimable}`}
						/>
					))}
				</box>
			)}
		</box>
	);
}
