import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { getContainerStats } from "../lib/containers.js";
import { col } from "../lib/table.js";
import { theme } from "../lib/theme.js";

const bold = createTextAttributes({ bold: true });

interface StatEntry {
	id: string;
	cpuPercentage?: string;
	memoryUsage?: string;
	netIO?: string;
	blockIO?: string;
	pids?: number;
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
					content={`${col("ID", 20)} ${col("CPU %", 8)} ${col("MEM", 12)} ${col("NET I/O", 14)} ${col("BLOCK I/O", 14)} PIDS`}
				/>
				{stats.map((s) => (
					<text
						key={s.id}
						fg={theme.text}
						content={`${col(s.id, 20)} ${col(s.cpuPercentage ?? "-", 8)} ${col(s.memoryUsage ?? "-", 12)} ${col(s.netIO ?? "-", 14)} ${col(s.blockIO ?? "-", 14)} ${s.pids ?? "-"}`}
					/>
				))}
				{stats.length === 0 && !error && (
					<text fg={theme.muted} content="  Loading..." />
				)}
			</box>
		</box>
	);
}
