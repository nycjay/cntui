import { createTextAttributes } from "@opentui/core";

const bold = createTextAttributes({ bold: true });
const dim = createTextAttributes({ dim: true });

const LOGO = `
 ┌─────────────────────────────────────┐
 │                                     │
 │   ╭───╮                             │
 │   │ ▶ │   ___  _ __  ___ _   _ _   │
 │   ╰───╯  / __|| '_ \\| __| | | |_|  │
 │          | (__ | | | | |_| |_| | |  │
 │           \\___||_| |_|\\__|\\__,_|_|  │
 │                                     │
 └─────────────────────────────────────┘
`;

export function Splash({ version }: { version: string }) {
	return (
		<box
			flexDirection="column"
			width="100%"
			height="100%"
			justifyContent="center"
			alignItems="center"
		>
			<text fg="#a6e3a1" attributes={bold} content={LOGO} />
			<text fg="#6c7086" attributes={dim} content={`v${version}`} />
		</box>
	);
}
