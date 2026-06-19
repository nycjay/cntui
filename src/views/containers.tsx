import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { ActionMenu } from "../components/action-menu.js";
import { Confirm } from "../components/confirm.js";
import { InspectView } from "../components/inspect-view.js";
import { LogViewer } from "../components/log-viewer.js";
import {
	deleteContainer,
	listContainers,
	pruneContainers,
	startContainer,
	stopContainer,
} from "../lib/containers.js";
import { col } from "../lib/table.js";
import { theme } from "../lib/theme.js";
import type { Container } from "../types/container.js";

const bold = createTextAttributes({ bold: true });
const dim = createTextAttributes({ dim: true });

type SubView =
	| { type: "logs" | "inspect"; id: string }
	| { type: "menu"; id: string; state: string }
	| null;

type PendingAction = {
	type: "start" | "stop" | "delete" | "prune";
	id: string;
} | null;

export function ContainersView({
	refreshInterval = 3,
}: {
	refreshInterval?: number;
}) {
	const [containers, setContainers] = useState<Container[]>([]);
	const [selected, setSelected] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState<PendingAction>(null);
	const [subView, setSubView] = useState<SubView>(null);

	const refresh = async () => {
		try {
			setContainers(await listContainers());
		} catch (e) {
			setError((e as Error).message);
		}
	};

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
			if (pending.type === "prune") await pruneContainers();
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
		if (key.name === "p") {
			setPending({ type: "prune", id: "" });
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
		if (key.name === "l") {
			setSubView({ type: "logs", id: c.id });
		}
		if (key.name === "i") {
			setSubView({ type: "inspect", id: c.id });
		}
		if (key.name === "return") {
			setSubView({ type: "menu", id: c.id, state: c.status.state });
		}
	});

	if (subView?.type === "menu") {
		const isRunning = subView.state === "running";
		const actions = [
			...(isRunning
				? [
						{
							key: "l",
							label: "Logs",
							onSelect: () => setSubView({ type: "logs", id: subView.id }),
						},
						{
							key: "s",
							label: "Stop",
							onSelect: () => {
								setSubView(null);
								setPending({ type: "stop", id: subView.id });
							},
						},
					]
				: [
						{
							key: "s",
							label: "Start",
							onSelect: () => {
								setSubView(null);
								setPending({ type: "start", id: subView.id });
							},
						},
					]),
			{
				key: "i",
				label: "Inspect",
				onSelect: () => setSubView({ type: "inspect", id: subView.id }),
			},
			{
				key: "d",
				label: "Delete",
				onSelect: () => {
					setSubView(null);
					setPending({ type: "delete", id: subView.id });
				},
			},
		];
		return (
			<ActionMenu
				title={subView.id}
				actions={actions}
				onClose={() => setSubView(null)}
			/>
		);
	}

	if (subView?.type === "logs") {
		return (
			<LogViewer containerId={subView.id} onBack={() => setSubView(null)} />
		);
	}

	if (subView?.type === "inspect") {
		return (
			<InspectView containerId={subView.id} onBack={() => setSubView(null)} />
		);
	}

	if (pending) {
		const msg =
			pending.type === "prune"
				? "Prune all stopped containers?"
				: `${pending.type} container "${pending.id}"?`;
		return (
			<Confirm
				message={msg}
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
				content={`Containers (${containers.length})`}
			/>
			<text fg={theme.muted} content={header} />
			{containers.map((c, i) => {
				const ports =
					c.configuration.publishedPorts
						?.map((p) => `${p.hostPort}:${p.containerPort}`)
						.join(", ") ?? "";
				const prefix = i === selected ? "▸ " : "  ";
				const image = c.configuration.image.reference ?? "";
				const stateColor =
					c.status.state === "running" ? theme.success : theme.muted;
				const line = `${prefix}${col(c.id, 24)} `;
				const statePart = col(c.status.state, 10);
				const rest = ` ${col(image, 30)} ${ports}`;
				return (
					<box key={c.id} flexDirection="row">
						<text
							fg={i === selected ? theme.selected : theme.text}
							attributes={i === selected ? bold : undefined}
							content={line}
						/>
						<text
							fg={i === selected ? theme.selected : stateColor}
							attributes={i === selected ? bold : undefined}
							content={statePart}
						/>
						<text
							fg={i === selected ? theme.selected : theme.text}
							attributes={i === selected ? bold : undefined}
							content={rest}
						/>
					</box>
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
