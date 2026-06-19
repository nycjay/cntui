import { createTextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useEffect, useState } from "react";
import { inspectContainer } from "../lib/containers.js";
import { theme } from "../lib/theme.js";

const bold = createTextAttributes({ bold: true });

function colorForLine(line: string): string {
	const trimmed = line.trimStart();
	if (trimmed.startsWith('"') && trimmed.includes('":')) return "cyan";
	if (trimmed.startsWith('"')) return "green";
	if (/^\d|^true|^false|^null/.test(trimmed)) return "yellow";
	return theme.muted;
}

export function InspectView({
	containerId,
	onBack,
}: {
	containerId: string;
	onBack: () => void;
}) {
	const [lines, setLines] = useState<string[]>([]);
	const [offset, setOffset] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const { height } = useTerminalDimensions();
	const viewportHeight = Math.max(5, height - 5);

	useEffect(() => {
		(async () => {
			try {
				const data = await inspectContainer(containerId);
				const json = JSON.stringify(data, null, 2);
				setLines(json.split("\n"));
			} catch (e) {
				setError((e as Error).message);
			}
		})();
	}, []);

	useKeyboard((key) => {
		if (key.name === "escape" || key.name === "q") onBack();
		if (key.name === "up") setOffset((o) => Math.max(0, o - 1));
		if (key.name === "down")
			setOffset((o) =>
				Math.min(Math.max(0, lines.length - viewportHeight), o + 1),
			);
		if (key.name === "g" && !key.shift) setOffset(0);
		if (key.name === "g" && key.shift)
			setOffset(Math.max(0, lines.length - viewportHeight));
	});

	const visible = lines.slice(offset, offset + viewportHeight);

	return (
		<box flexDirection="column">
			<text
				fg={theme.text}
				attributes={bold}
				content={`Inspect: ${containerId} — [↑↓] scroll [g/G] top/bottom [Esc] back`}
			/>
			{error && <text fg={theme.error} content={`Error: ${error}`} />}
			<box
				flexDirection="column"
				marginTop={1}
				borderStyle="single"
				borderColor={theme.border}
				paddingX={1}
			>
				{visible.map((line, i) => (
					<text
						key={`${offset + i}`}
						fg={colorForLine(line)}
						content={line || " "}
					/>
				))}
			</box>
		</box>
	);
}
