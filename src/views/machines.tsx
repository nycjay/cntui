import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import {
	type Machine,
	deleteMachine,
	listMachines,
	stopMachine,
} from "../lib/machines.js";

const bold = createTextAttributes({ bold: true });
const dim = createTextAttributes({ dim: true });

export function MachinesView() {
	const [machines, setMachines] = useState<Machine[]>([]);
	const [selected, setSelected] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const refresh = async () => {
		try {
			setMachines(await listMachines());
			setError(null);
		} catch (e) {
			setError((e as Error).message);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
	useEffect(() => {
		refresh();
	}, []);

	useKeyboard(async (key) => {
		if (key.name === "up") setSelected((s) => Math.max(0, s - 1));
		if (key.name === "down")
			setSelected((s) => Math.min(machines.length - 1, s + 1));
		if (key.name === "r") await refresh();

		const m = machines[selected];
		if (!m) return;

		if (key.name === "s") {
			await stopMachine(m.id);
			await refresh();
		}
		if (key.name === "d") {
			await deleteMachine(m.id);
			await refresh();
		}
	});

	if (error) return <text fg="red" content={`Error: ${error}`} />;

	const header = `  ${"NAME".padEnd(24)} ${"STATUS".padEnd(12)} ${"IMAGE".padEnd(30)} DEFAULT`;

	return (
		<box flexDirection="column">
			<text
				attributes={bold}
				content={`Machines (${machines.length}) — [s] stop [d] delete [r] refresh`}
			/>
			<text attributes={bold} content={header} />
			{machines.map((m, i) => {
				const prefix = i === selected ? "▸ " : "  ";
				const line = `${prefix}${m.id.padEnd(24)} ${m.status.padEnd(12)} ${m.image.padEnd(30)} ${m.default ? "★" : ""}`;
				return (
					<text
						key={m.id}
						fg={i === selected ? "green" : undefined}
						attributes={i === selected ? bold : undefined}
						content={line}
					/>
				);
			})}
			{machines.length === 0 && (
				<text attributes={dim} content=" No machines found" />
			)}
		</box>
	);
}
