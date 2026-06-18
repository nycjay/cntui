import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import {
	deleteContainer,
	listContainers,
	startContainer,
	stopContainer,
} from "../lib/containers.js";
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

	if (error) return <text fg="red" content={`Error: ${error}`} />;

	const header = `  ${"ID".padEnd(20)} ${"STATE".padEnd(12)} ${"IMAGE".padEnd(30)} PORTS`;

	return (
		<box flexDirection="column">
			<text
				attributes={bold}
				content={`Containers (${containers.length}) — [s] start/stop [d] delete [r] refresh`}
			/>
			<text attributes={bold} content={header} />
			{containers.map((c, i) => {
				const ports =
					c.configuration.publishedPorts
						?.map((p) => `${p.hostPort}:${p.containerPort}`)
						.join(", ") ?? "";
				const prefix = i === selected ? "▸ " : "  ";
				const image = c.configuration.image.reference ?? "";
				const line = `${prefix}${c.id.padEnd(20)} ${c.status.state.padEnd(12)} ${image.padEnd(30)} ${ports}`;
				return (
					<text
						key={c.id}
						fg={i === selected ? "green" : undefined}
						attributes={i === selected ? bold : undefined}
						content={line}
					/>
				);
			})}
			{containers.length === 0 && (
				<text attributes={dim} content=" No containers found" />
			)}
		</box>
	);
}
