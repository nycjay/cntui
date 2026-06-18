import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import {
	deleteContainer,
	listContainers,
	startContainer,
	stopContainer,
} from "../lib/containers.js";
import { col } from "../lib/table.js";
import { theme } from "../lib/theme.js";
import type { Container } from "../types/container.js";

const bold = createTextAttributes({ bold: true });
const dim = createTextAttributes({ dim: true });

export function ContainersView({
	refreshInterval = 3,
}: { refreshInterval?: number }) {
	const [containers, setContainers] = useState<Container[]>([]);
	const [selected, setSelected] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const refresh = async () => {
		try {
			setContainers(await listContainers());
			setError(null);
		} catch (e) {
			setError((e as Error).message);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
	useEffect(() => {
		refresh();
		const interval = setInterval(refresh, refreshInterval * 1000);
		return () => clearInterval(interval);
	}, []);

	useKeyboard(async (key) => {
		if (key.name === "up") setSelected((s) => Math.max(0, s - 1));
		if (key.name === "down")
			setSelected((s) => Math.min(containers.length - 1, s + 1));
		if (key.name === "r") await refresh();

		const c = containers[selected];
		if (!c) return;

		if (key.name === "s") {
			if (c.status.state === "running") await stopContainer(c.id);
			else await startContainer(c.id);
			await refresh();
		}
		if (key.name === "d") {
			await deleteContainer(c.id, true);
			await refresh();
		}
	});

	if (error) return <text fg={theme.error} content={`Error: ${error}`} />;

	const header = `  ${col("ID", 24)} ${col("STATE", 10)} ${col("IMAGE", 30)} PORTS`;
	const current = containers[selected];

	return (
		<box flexDirection="column">
			<text
				fg={theme.text}
				attributes={bold}
				content={`Containers (${containers.length}) — [s] start/stop [d] delete [r] refresh`}
			/>
			<text fg={theme.muted} content={header} />
			{containers.map((c, i) => {
				const ports =
					c.configuration.publishedPorts
						?.map((p) => `${p.hostPort}:${p.containerPort}`)
						.join(", ") ?? "";
				const prefix = i === selected ? "▸ " : "  ";
				const image = c.configuration.image.reference ?? "";
				const line = `${prefix}${col(c.id, 24)} ${col(c.status.state, 10)} ${col(image, 30)} ${ports}`;
				return (
					<text
						key={c.id}
						fg={i === selected ? theme.selected : theme.text}
						attributes={i === selected ? bold : undefined}
						content={line}
					/>
				);
			})}
			{containers.length === 0 && (
				<text
					fg={theme.muted}
					attributes={dim}
					content="  No containers found"
				/>
			)}
			{current && (
				<box
					marginTop={1}
					borderStyle="single"
					borderColor={theme.border}
					paddingX={1}
					flexDirection="column"
				>
					<text fg={theme.text} attributes={bold} content={current.id} />
					<text
						fg={theme.muted}
						content={`Image: ${current.configuration.image.reference}`}
					/>
					<text
						fg={theme.muted}
						content={`State: ${current.status.state} | CPUs: ${current.configuration.resources.cpus} | Memory: ${(current.configuration.resources.memoryInBytes / 1e9).toFixed(1)}G`}
					/>
					{(current.configuration.publishedPorts?.length ?? 0) > 0 && (
						<text
							fg={theme.muted}
							content={`Ports: ${current.configuration.publishedPorts.map((p) => `${p.hostPort}:${p.containerPort}/${p.proto}`).join(", ")}`}
						/>
					)}
				</box>
			)}
		</box>
	);
}
