import { createTextAttributes } from "@opentui/core";

const dim = createTextAttributes({ dim: true });

export function StatusBar() {
	return (
		<box borderStyle="single" borderColor="#45475a" paddingX={1}>
			<text
				fg="#6c7086"
				attributes={dim}
				content="[1-5] Switch Tab | ↑↓ Navigate | [s] Start/Stop | [d] Delete | [r] Refresh | [q] Quit"
			/>
		</box>
	);
}
