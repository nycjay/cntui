import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import {
	type Machine,
	deleteMachine,
	listMachines,
	stopMachine,
} from "../lib/machines.js";
import { col } from "../lib/table.js";

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

	const header = `  ${col("NAME", 24)} ${col("STATUS", 10)} ${col("IMAGE", 35)} DEFAULT`;

	return (
		<box flexDirection="column">
			<text
				fg="#cdd6f4"
				attributes={bold}
				content={`Machines (${machines.length}) — [s] stop [d] delete [r] refresh`}
			/>
			<text fg="#6c7086" attributes={bold} content={header} />
			{machines.map((m, i) => {
				const prefix = i === selected ? "▸ " : "  ";
				const line = `${prefix}${col(m.id, 24)} ${col(m.status, 10)} ${col(m.image, 35)} ${m.default ? "★" : ""}`;
				return (
					<text
						key={m.id}
						fg={i === selected ? "#a6e3a1" : "#cdd6f4"}
						attributes={i === selected ? bold : undefined}
						content={line}
					/>
				);
			})}
			{machines.length === 0 && (
				<text fg="#6c7086" attributes={dim} content="  No machines found" />
			)}
		</box>
	);
}
