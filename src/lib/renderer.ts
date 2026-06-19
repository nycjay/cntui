import type { CliRenderer } from "@opentui/core";

let _renderer: CliRenderer | null = null;

export function setRenderer(r: CliRenderer) {
	_renderer = r;
}

export function getRenderer(): CliRenderer {
	if (!_renderer) throw new Error("Renderer not initialized");
	return _renderer;
}
