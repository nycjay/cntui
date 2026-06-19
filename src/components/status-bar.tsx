import { createTextAttributes } from "@opentui/core";
import { theme } from "../lib/theme.js";

const dim = createTextAttributes({ dim: true });

const HINTS: Record<string, string> = {
	containers:
		"[1-5] Tab | ↑↓ Navigate | [Enter] Actions | [s] Start/Stop | [d] Delete | [p] Prune | [r] Refresh | [q] Quit",
	images:
		"[1-5] Tab | ↑↓ Navigate | [d] Delete | [p] Prune | [r] Refresh | [q] Quit",
	volumes:
		"[1-5] Tab | ↑↓ Navigate | [d] Delete | [p] Prune | [r] Refresh | [q] Quit",
	machines:
		"[1-5] Tab | ↑↓ Navigate | [s] Stop | [d] Delete | [r] Refresh | [q] Quit",
	system: "[1-5] Tab | [s] Start/Stop Service | [r] Refresh | [q] Quit",
};

export function StatusBar({ activeTab }: { activeTab: string }) {
	return (
		<box borderStyle="single" borderColor={theme.border} paddingX={1}>
			<text
				fg={theme.muted}
				attributes={dim}
				content={HINTS[activeTab] ?? HINTS.containers}
			/>
		</box>
	);
}
