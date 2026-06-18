import { createTextAttributes } from "@opentui/core";

const dim = createTextAttributes({ dim: true });

export function StatusBar() {
	return (
		<box borderStyle="single" paddingX={1}>
			<text
				attributes={dim}
				content="[1-5] Switch Tab | [Enter] Select | [d] Delete | [s] Start/Stop | [q] Quit"
			/>
		</box>
	);
}
