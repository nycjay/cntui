import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { Confirm } from "../components/confirm.js";
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

type PendingAction = { type: "start" | "stop" | "delete"; id: string } | null;

export function ContainersView({
	refreshInterval = 3,
}: { refreshInterval?: number }) {
	const [containers, setContainers] = useState<Container[]>([]);
	const [selected, setSelected] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState<PendingAction>(null);

	const refresh = async () => {
		try {
			setContainers(await listContainers());
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

	const execAction = async () => {
		if (!pending) return;
		try {
			if (pending.type === "start") await startContainer(pending.id);
			if (pending.type === "stop") await stopContainer(pending.id);
			if (pending.type === "delete") await deleteContainer(pending.id, true);
		} catch (e) {
			setPending(null);
			setError((e as Error).message);
			return;
		}
		setPending(null);
		await refresh();
	};

	useKeyboard((key) => {
		if (pending) return;
		if (key.name === "escape" && error) {
			setError(null);
			return;
		}
		if (key.name === "up") setSelected((s) => Math.max(0, s - 1));
		if (key.name === "down")
			setSelected((s) => Math.min(containers.length - 1, s + 1));
		if (key.name === "r") {
			setError(null);
			refresh();
			return;
		}

		const c = containers[selected];
		if (!c) return;

		if (key.name === "s") {
			const type = c.status.state === "running" ? "stop" : "start";
			setPending({ type, id: c.id });
		}
		if (key.name === "d") {
			setPending({ type: "delete", id: c.id });
		}
	});

	if (pending) {
		return (
			<Confirm
				message={`${pending.type} container "${pending.id}"?`}
				onConfirm={execAction}
				onCancel={() => setPending(null)}
			/>
		);
	}

	const header = `  ${col("ID", 24)} ${col("STATE", 10)} ${col("IMAGE", 30)} PORTS`;
	const current = containers[selected];

	return (
		<box flexDirection="column">
			{error && (
				<text
					fg={theme.error}
					content={`Error: ${error} (press Esc to dismiss)`}
				/>
			)}
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
