import { createTextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useEffect, useRef, useState } from "react";
import { getContainerLogs } from "../lib/containers.js";
import { theme } from "../lib/theme.js";

const bold = createTextAttributes({ bold: true });

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
	const tailing = useRef(true);
	const [isTailing, setIsTailing] = useState(true);
	const polling = useRef<ReturnType<typeof setInterval> | null>(null);
	const { height } = useTerminalDimensions();
	const viewportHeight = Math.max(20, height - 5);

	const fetchLogs = async () => {
		try {
			const output = await getContainerLogs(containerId, 200);
			const newLines = output.split("\n");
			setLines(newLines);
			if (tailing.current) {
				setOffset(Math.max(0, newLines.length - viewportHeight));
			}
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
	}, [viewportHeight]);

	const setTail = (value: boolean) => {
		tailing.current = value;
		setIsTailing(value);
	};

	const scrollToEnd = () => {
		setTail(true);
		setOffset(Math.max(0, lines.length - viewportHeight));
	};

	useKeyboard((key) => {
		if (key.name === "escape" || key.name === "q") onBack();
		if (key.name === "up") {
			setTail(false);
			setOffset((o) => Math.max(0, o - 1));
		}
		if (key.name === "down") {
			setOffset((o) => {
				const next = Math.min(
					Math.max(0, lines.length - viewportHeight),
					o + 1,
				);
				if (next >= lines.length - viewportHeight) setTail(true);
				return next;
			});
		}
		if (key.name === "g" && !key.shift) {
			setTail(false);
			setOffset(0);
		}
		if ((key.name === "g" && key.shift) || key.name === "f") {
			scrollToEnd();
		}
	});

	const visible = lines.slice(offset, offset + viewportHeight);
	// Pad to fill viewport so the box stays a consistent size
	while (visible.length < viewportHeight) {
		visible.push("");
	}
	const modeLabel = isTailing ? "TAIL" : "PAUSED";

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
				flexGrow={1}
				marginTop={1}
				borderStyle="single"
				borderColor={theme.border}
				paddingX={1}
			>
				{visible.map((line, i) => (
					<text key={`${offset + i}`} fg={theme.text} content={line || " "} />
				))}
			</box>
		</box>
	);
}
