/**
 * Truncate or pad a string to exactly `width` characters.
 */
export function col(value: string, width: number): string {
	if (value.length > width) return `${value.slice(0, width - 1)}…`;
	return value.padEnd(width);
}
