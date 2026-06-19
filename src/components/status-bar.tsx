import { createTextAttributes } from "@opentui/core";
import { theme } from "../lib/theme.js";

const dim = createTextAttributes({ dim: true });

export function StatusBar() {
	return (
		<box borderStyle="single" borderColor={theme.border} paddingX={1}>
			<text
				fg={theme.muted}
				attributes={dim}
				content="[1-5] Tab | ↑↓ Navigate | [s] Start/Stop | [d] Delete | [l] Logs | [i] Inspect | [r] Refresh | [q] Quit"
			/>
		</box>
	);
}
