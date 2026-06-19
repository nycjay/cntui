import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { Confirm } from "../components/confirm.js";
import { col } from "../lib/table.js";
import { theme } from "../lib/theme.js";
import { deleteVolume, listVolumes } from "../lib/volumes.js";
import type { Volume } from "../types/container.js";

const bold = createTextAttributes({ bold: true });
const dim = createTextAttributes({ dim: true });

export function VolumesView() {
	const [volumes, setVolumes] = useState<Volume[]>([]);
	const [selected, setSelected] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [pendingDelete, setPendingDelete] = useState<string | null>(null);

	const refresh = async () => {
		try {
			setVolumes(await listVolumes());
			setError(null);
		} catch (e) {
			setError((e as Error).message);
		}
	};

	useEffect(() => {
		refresh();
	}, []);

	const execDelete = async () => {
		if (!pendingDelete) return;
		try {
			await deleteVolume(pendingDelete);
		} catch (e) {
			setError((e as Error).message);
		}
		setPendingDelete(null);
		await refresh();
	};

	useKeyboard((key) => {
		if (pendingDelete) return;
		if (key.name === "up") setSelected((s) => Math.max(0, s - 1));
		if (key.name === "down")
			setSelected((s) => Math.min(volumes.length - 1, s + 1));
		if (key.name === "r") {
			refresh();
			return;
		}

		const vol = volumes[selected];
		if (!vol) return;

		if (key.name === "d") {
			setPendingDelete(vol.name);
		}
	});

	if (pendingDelete) {
		return (
			<Confirm
				message={`Delete volume "${pendingDelete}"?`}
				onConfirm={execDelete}
				onCancel={() => setPendingDelete(null)}
			/>
		);
	}

	if (error) return <text fg={theme.error} content={`Error: ${error}`} />;

	const header = `  ${col("NAME", 45)} CREATED`;

	return (
		<box flexDirection="column">
			<text
				fg={theme.text}
				attributes={bold}
				content={`Volumes (${volumes.length})`}
			/>
			<text fg={theme.muted} content={header} />
			{volumes.map((vol, i) => {
				const prefix = i === selected ? "▸ " : "  ";
				const line = `${prefix}${col(vol.name, 45)} ${vol.createdAt ?? ""}`;
				return (
					<text
						key={vol.name}
						fg={i === selected ? theme.selected : theme.text}
						attributes={i === selected ? bold : undefined}
						content={line}
					/>
				);
			})}
			{volumes.length === 0 && (
				<text fg={theme.muted} attributes={dim} content="  No volumes found" />
			)}
		</box>
	);
}
