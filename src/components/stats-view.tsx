import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { getContainerStats } from "../lib/containers.js";
import { col } from "../lib/table.js";
import { theme } from "../lib/theme.js";

const bold = createTextAttributes({ bold: true });

interface StatEntry {
	id: string;
	cpuUsageUsec: number;
	memoryUsageBytes: number;
	memoryLimitBytes: number;
	networkRxBytes: number;
	networkTxBytes: number;
	blockReadBytes: number;
	blockWriteBytes: number;
	numProcesses: number;
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const units = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

function formatCpu(usec: number): string {
	return `${(usec / 1_000_000).toFixed(2)}s`;
}

export function StatsView({
	containerId,
	onBack,
}: {
	containerId: string;
	onBack: () => void;
}) {
	const [stats, setStats] = useState<StatEntry[]>([]);
	const [error, setError] = useState<string | null>(null);

	const refresh = async () => {
		try {
			const output = await getContainerStats(containerId);
			setStats(JSON.parse(output) as StatEntry[]);
		} catch (e) {
			setError((e as Error).message);
		}
	};

	useEffect(() => {
		refresh();
		const interval = setInterval(refresh, 2000);
		return () => clearInterval(interval);
	}, []);

	useKeyboard((key) => {
		if (key.name === "escape" || key.name === "q") onBack();
		if (key.name === "r") refresh();
	});

	return (
		<box flexDirection="column">
			<text
				fg={theme.text}
				attributes={bold}
				content={`Stats: ${containerId} (updates every 2s) — [Esc] back`}
			/>
			{error && <text fg={theme.error} content={`Error: ${error}`} />}
			<box
				flexDirection="column"
				marginTop={1}
				borderStyle="single"
				borderColor={theme.border}
				paddingX={1}
			>
				<text
					fg={theme.muted}
					content={`${col("ID", 20)} ${col("CPU", 10)} ${col("MEM", 16)} ${col("NET I/O", 18)} ${col("BLOCK I/O", 18)} PIDS`}
				/>
				{stats.map((s) => (
					<text
						key={s.id}
						fg={theme.text}
						content={`${col(s.id, 20)} ${col(formatCpu(s.cpuUsageUsec), 10)} ${col(`${formatBytes(s.memoryUsageBytes)} / ${formatBytes(s.memoryLimitBytes)}`, 16)} ${col(`${formatBytes(s.networkRxBytes)} / ${formatBytes(s.networkTxBytes)}`, 18)} ${col(`${formatBytes(s.blockReadBytes)} / ${formatBytes(s.blockWriteBytes)}`, 18)} ${s.numProcesses}`}
					/>
				))}
				{stats.length === 0 && !error && (
					<text fg={theme.muted} content="  Loading..." />
				)}
			</box>
		</box>
	);
}
