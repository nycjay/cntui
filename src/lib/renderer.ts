import type { CliRenderer } from "@opentui/core";

let _renderer: CliRenderer | null = null;

export function setRenderer(r: CliRenderer) {
	_renderer = r;
}

export function getRenderer(): CliRenderer {
	if (!_renderer) throw new Error("Renderer not initialized");
	return _renderer;
}

/** Leave alternate screen, reset attributes, clear screen, move cursor home. */
export function resetTerminal(): void {
	process.stdout.write("\x1b[?1049l\x1b[0m\x1b[2J\x1b[H");
}
