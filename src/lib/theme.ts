/**
 * Theme colors using ANSI indexed colors (0-15).
 * These adapt to the terminal's configured color scheme,
 * ensuring readability on both light and dark backgrounds.
 */
export const theme = {
	/** Primary text — terminal's default foreground */
	text: "7",
	/** Selected/highlighted item */
	selected: "2",
	/** Column headers and muted text */
	muted: "8",
	/** Errors and stopped status */
	error: "1",
	/** Success and running status */
	success: "2",
	/** Tab bar active */
	active: "6",
	/** Borders */
	border: "8",
} as const;
