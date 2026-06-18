import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface Config {
	refresh_interval: number;
	default_tab: "containers" | "images" | "volumes" | "machines" | "system";
	auto_start_service: boolean;
}

const DEFAULT_CONFIG: Config = {
	refresh_interval: 3,
	default_tab: "containers",
	auto_start_service: false,
};

const CONFIG_PATH = join(homedir(), ".config", "cntui", "config.toml");

function parseTOML(content: string): Record<string, string> {
	const result: Record<string, string> = {};
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eq = trimmed.indexOf("=");
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		let value = trimmed.slice(eq + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		result[key] = value;
	}
	return result;
}

export function loadConfig(): Config {
	if (!existsSync(CONFIG_PATH)) return { ...DEFAULT_CONFIG };

	try {
		const content = readFileSync(CONFIG_PATH, "utf-8");
		const raw = parseTOML(content);
		return {
			refresh_interval: raw.refresh_interval
				? Number(raw.refresh_interval)
				: DEFAULT_CONFIG.refresh_interval,
			default_tab:
				(raw.default_tab as Config["default_tab"]) ??
				DEFAULT_CONFIG.default_tab,
			auto_start_service: raw.auto_start_service === "true",
		};
	} catch {
		return { ...DEFAULT_CONFIG };
	}
}

export { CONFIG_PATH };
