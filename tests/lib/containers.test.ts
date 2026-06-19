import { describe, expect, test } from "bun:test";
import { listContainers } from "../../src/lib/containers.js";

describe("containers", () => {
	test("listContainers returns array or throws if CLI unavailable", async () => {
		let result: unknown;
		try {
			result = await listContainers();
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			return;
		}
		expect(Array.isArray(result)).toBe(true);
	});
});
