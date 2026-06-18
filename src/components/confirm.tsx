import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { theme } from "../lib/theme.js";

const bold = createTextAttributes({ bold: true });

export function Confirm({
	message,
	onConfirm,
	onCancel,
}: {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	useKeyboard((key) => {
		if (key.name === "y") onConfirm();
		if (key.name === "n" || key.name === "escape") onCancel();
	});

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
				paddingX={2}
				paddingY={1}
				flexDirection="column"
				alignItems="center"
			>
				<text fg={theme.text} attributes={bold} content={message} />
				<text fg={theme.muted} content="[y] Confirm  [n] Cancel" />
			</box>
		</box>
	);
}
