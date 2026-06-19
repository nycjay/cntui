import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { theme } from "../lib/theme.js";

const bold = createTextAttributes({ bold: true });
const dim = createTextAttributes({ dim: true });

const HELP: Record<string, string[]> = {
	containers: [
		"↑/↓       Navigate list",
		"Enter     Open action menu",
		"s         Start / Stop container",
		"d         Delete container",
		"l         View logs",
		"i         Inspect (JSON)",
		"t         Stats",
		"p         Prune stopped containers",
		"r         Refresh",
	],
	images: [
		"↑/↓       Navigate list",
		"d         Delete image",
		"p         Prune images",
		"r         Refresh",
	],
	volumes: [
		"↑/↓       Navigate list",
		"d         Delete volume",
		"p         Prune unused volumes",
		"r         Refresh",
	],
	machines: [
		"↑/↓       Navigate list",
		"s         Stop machine",
		"d         Delete machine",
		"r         Refresh",
	],
	system: ["s         Start / Stop service", "r         Refresh"],
};

const GLOBAL = [
	"1-5       Switch tabs",
	"?         Toggle this help",
	"q         Quit",
];

export function HelpOverlay({
	activeTab,
	onClose,
}: {
	activeTab: string;
	onClose: () => void;
}) {
	useKeyboard((key) => {
		if (key.name === "escape" || key.name === "q" || key.name === "?") {
			onClose();
		}
	});

	const tabHelp = HELP[activeTab] ?? HELP.containers;

	return (
		<box
			flexDirection="column"
			width="100%"
			height="100%"
			backgroundColor="#1a1b26"
			shouldFill={true}
			justifyContent="center"
			alignItems="center"
		>
			<box
				borderStyle="single"
				borderColor={theme.border}
				paddingX={3}
				paddingY={1}
				flexDirection="column"
			>
				<text
					fg={theme.text}
					attributes={bold}
					content={`Keybindings — ${activeTab}`}
				/>
				<text fg={theme.muted} content="" />
				{tabHelp.map((line) => (
					<text key={line} fg={theme.text} content={`  ${line}`} />
				))}
				<text fg={theme.muted} content="" />
				<text fg={theme.text} attributes={bold} content="Global" />
				{GLOBAL.map((line) => (
					<text key={line} fg={theme.text} content={`  ${line}`} />
				))}
				<text fg={theme.muted} content="" />
				<text
					fg={theme.muted}
					attributes={dim}
					content="Press ? or Esc to close"
				/>
			</box>
		</box>
	);
}
