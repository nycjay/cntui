import { describe, expect, test } from "bun:test";
import { loadConfig } from "../../src/lib/config.js";

describe("config", () => {
	test("loadConfig returns defaults when no config file exists", () => {
		const config = loadConfig();
		expect(config.refresh_interval).toBe(3);
		expect(config.default_tab).toBe("containers");
		expect(config.auto_start_service).toBe(false);
	});
});
