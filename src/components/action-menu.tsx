import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { theme } from "../lib/theme.js";

const bold = createTextAttributes({ bold: true });

export interface MenuAction {
	key: string;
	label: string;
	onSelect: () => void;
}

export function ActionMenu({
	title,
	actions,
	onClose,
}: {
	title: string;
	actions: MenuAction[];
	onClose: () => void;
}) {
	const [selected, setSelected] = useState(0);

	useKeyboard((key) => {
		if (key.name === "escape" || key.name === "q") onClose();
		if (key.name === "up") setSelected((s) => Math.max(0, s - 1));
		if (key.name === "down")
			setSelected((s) => Math.min(actions.length - 1, s + 1));
		if (key.name === "return") actions[selected]?.onSelect();
		for (const action of actions) {
			if (key.name === action.key) action.onSelect();
		}
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
			>
				<text fg={theme.text} attributes={bold} content={title} />
				{actions.map((a, i) => (
					<text
						key={a.key}
						fg={i === selected ? theme.selected : theme.text}
						attributes={i === selected ? bold : undefined}
						content={`${i === selected ? "▸" : " "} [${a.key}] ${a.label}`}
					/>
				))}
				<text fg={theme.muted} content="  [Esc] Cancel" />
			</box>
		</box>
	);
}
