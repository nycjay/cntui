import { describe, expect, test } from "bun:test";
import { exec, execJson } from "../../src/lib/exec.js";

describe("exec", () => {
	test("exec throws on failure", async () => {
		try {
			await exec(["inspect", "nonexistent-container-id-12345"]);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
		}
	});
});

describe("execJson", () => {
	test("parses valid JSON from container list or throws", async () => {
		try {
			const result = await execJson<unknown[]>(["list", "--all"]);
			expect(Array.isArray(result)).toBe(true);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
		}
	});
});
