import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useRef, useState } from "react";
import { getContainerLogs } from "../lib/containers.js";
import { theme } from "../lib/theme.js";

const bold = createTextAttributes({ bold: true });
const dim = createTextAttributes({ dim: true });

export function LogViewer({
	containerId,
	onBack,
}: {
	containerId: string;
	onBack: () => void;
}) {
	const [lines, setLines] = useState<string[]>([]);
	const [offset, setOffset] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const polling = useRef<ReturnType<typeof setInterval> | null>(null);

	const fetchLogs = async () => {
		try {
			const output = await getContainerLogs(containerId, 200);
			setLines(output.split("\n"));
			setError(null);
		} catch (e) {
			setError((e as Error).message);
		}
	};

	useEffect(() => {
		fetchLogs();
		polling.current = setInterval(fetchLogs, 2000);
		return () => {
			if (polling.current) clearInterval(polling.current);
		};
	}, []);

	useKeyboard((key) => {
		if (key.name === "escape" || key.name === "q") onBack();
		if (key.name === "up") setOffset((o) => Math.max(0, o - 1));
		if (key.name === "down")
			setOffset((o) => Math.min(Math.max(0, lines.length - 20), o + 1));
		if (key.name === "g") setOffset(0);
		if (key.name === "G") setOffset(Math.max(0, lines.length - 20));
	});

	const visible = lines.slice(offset, offset + 20);

	return (
		<box flexDirection="column">
			<text
				fg={theme.text}
				attributes={bold}
				content={`Logs: ${containerId} (${lines.length} lines) — [↑↓] scroll [g/G] top/bottom [Esc] back`}
			/>
			{error && <text fg={theme.error} content={`Error: ${error}`} />}
			<box
				flexDirection="column"
				marginTop={1}
				borderStyle="single"
				borderColor={theme.border}
				paddingX={1}
			>
				{visible.length > 0 ? (
					visible.map((line, i) => (
						<text key={`${offset + i}`} fg={theme.text} content={line || " "} />
					))
				) : (
					<text
						fg={theme.muted}
						attributes={dim}
						content="  No logs available"
					/>
				)}
			</box>
		</box>
	);
}
