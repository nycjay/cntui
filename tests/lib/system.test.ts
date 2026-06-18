import { describe, expect, test } from "bun:test";
import { getSystemStatus, isContainerInstalled } from "../../src/lib/system.js";

describe("system", () => {
	test("isContainerInstalled returns boolean", async () => {
		const result = await isContainerInstalled();
		expect(typeof result).toBe("boolean");
	});

	test("getSystemStatus returns object with running field", async () => {
		const status = await getSystemStatus();
		expect(typeof status.running).toBe("boolean");
		if (status.running) {
			expect(status.version).toBeDefined();
		}
	});
});
