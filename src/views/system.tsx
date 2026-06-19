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
import { theme } from "../lib/theme.js";
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
			<text fg={theme.text} attributes={bold} content="System" />
			<text
				fg={status?.running ? theme.success : theme.error}
				content={`Service: ${status?.running ? "Running" : "Stopped"}`}
			/>
			{status?.version && (
				<text fg={theme.text} content={`Version: ${status.version}`} />
			)}
			{status?.commit && (
				<text fg={theme.muted} content={`Commit:  ${status.commit}`} />
			)}
			{diskUsage.length > 0 && (
				<box flexDirection="column" marginTop={1}>
					<text fg={theme.text} attributes={bold} content="Disk Usage" />
					<text
						fg={theme.muted}
						content={`  ${col("TYPE", 14)} ${col("TOTAL", 8)} ${col("ACTIVE", 8)} ${col("SIZE", 12)} RECLAIMABLE`}
					/>
					{diskUsage.map((d) => (
						<text
							key={d.type}
							fg={theme.text}
							content={`  ${col(d.type, 14)} ${col(String(d.total), 8)} ${col(String(d.active), 8)} ${col(d.size, 12)} ${d.reclaimable}`}
						/>
					))}
				</box>
			)}
		</box>
	);
}
