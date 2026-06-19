import { createTextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
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
	const [tailing, setTailing] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const polling = useRef<ReturnType<typeof setInterval> | null>(null);
	const { height } = useTerminalDimensions();
	const viewportHeight = Math.max(5, height - 5);

	const fetchLogs = async () => {
		try {
			const output = await getContainerLogs(containerId, 200);
			const newLines = output.split("\n");
			setLines(newLines);
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

	// Auto-scroll to bottom when tailing
	useEffect(() => {
		if (tailing) {
			setOffset(Math.max(0, lines.length - viewportHeight));
		}
	}, [lines.length, tailing, viewportHeight]);

	useKeyboard((key) => {
		if (key.name === "escape" || key.name === "q") onBack();
		if (key.name === "up") {
			setTailing(false);
			setOffset((o) => Math.max(0, o - 1));
		}
		if (key.name === "down") {
			setOffset((o) => {
				const next = Math.min(
					Math.max(0, lines.length - viewportHeight),
					o + 1,
				);
				if (next >= lines.length - viewportHeight) setTailing(true);
				return next;
			});
		}
		if (key.name === "g") {
			setTailing(false);
			setOffset(0);
		}
		if (key.name === "G") {
			setTailing(true);
			setOffset(Math.max(0, lines.length - viewportHeight));
		}
		if (key.name === "f") {
			setTailing(true);
		}
	});

	const visible = lines.slice(offset, offset + viewportHeight);
	const modeLabel = tailing ? "TAIL" : "PAUSED";

	return (
		<box flexDirection="column">
			<text
				fg={theme.text}
				attributes={bold}
				content={`Logs: ${containerId} (${lines.length} lines) [${modeLabel}] — [↑↓] scroll [g/G] top/bottom [f] follow [Esc] back`}
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
