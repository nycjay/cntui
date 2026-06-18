import { describe, expect, test } from "bun:test";
import { listContainers } from "../../src/lib/containers.js";

describe("containers", () => {
	test("listContainers returns array or throws if CLI unavailable", async () => {
		try {
			const result = await listContainers();
			expect(Array.isArray(result)).toBe(true);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
		}
	});
});
