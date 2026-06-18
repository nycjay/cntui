import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { col } from "../lib/table.js";
import { deleteVolume, listVolumes } from "../lib/volumes.js";
import type { Volume } from "../types/container.js";

const bold = createTextAttributes({ bold: true });
const dim = createTextAttributes({ dim: true });

export function VolumesView() {
	const [volumes, setVolumes] = useState<Volume[]>([]);
	const [selected, setSelected] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const refresh = async () => {
		try {
			setVolumes(await listVolumes());
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
			setSelected((s) => Math.min(volumes.length - 1, s + 1));
		if (key.name === "r") await refresh();

		const vol = volumes[selected];
		if (!vol) return;

		if (key.name === "d") {
			await deleteVolume(vol.name);
			await refresh();
		}
	});

	if (error) return <text fg="red" content={`Error: ${error}`} />;

	const header = `  ${col("NAME", 45)} CREATED`;

	return (
		<box flexDirection="column">
			<text
				fg="#cdd6f4"
				attributes={bold}
				content={`Volumes (${volumes.length}) — [d] delete [r] refresh`}
			/>
			<text fg="#6c7086" attributes={bold} content={header} />
			{volumes.map((vol, i) => {
				const prefix = i === selected ? "▸ " : "  ";
				const line = `${prefix}${col(vol.name, 45)} ${vol.createdAt ?? ""}`;
				return (
					<text
						key={vol.name}
						fg={i === selected ? "#a6e3a1" : "#cdd6f4"}
						attributes={i === selected ? bold : undefined}
						content={line}
					/>
				);
			})}
			{volumes.length === 0 && (
				<text fg="#6c7086" attributes={dim} content="  No volumes found" />
			)}
		</box>
	);
}
