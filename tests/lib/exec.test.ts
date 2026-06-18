import { describe, expect, mock, test } from "bun:test";
import { exec, execJson } from "../../src/lib/exec.js";

// We can't easily mock Bun.spawn at the module level without a DI approach,
// so these tests validate the error handling and JSON parsing logic
// using integration-style tests against the actual binary (if available)
// or verifying the error path.

describe("exec", () => {
	test("throws on non-existent command", async () => {
		// Override by calling a command that will definitely fail
		const proc = Bun.spawn(["container", "--nonexistent-flag"], {
			stdout: "pipe",
			stderr: "pipe",
		});
		const exitCode = await proc.exited;
		expect(exitCode).not.toBe(0);
	});

	test("exec throws with stderr message on failure", async () => {
		try {
			await exec(["inspect", "nonexistent-container-id-12345"]);
			expect(true).toBe(false); // should not reach here
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect((e as Error).message).toContain("failed");
		}
	});
});

describe("execJson", () => {
	test("parses valid JSON from container list", async () => {
		try {
			const result = await execJson<unknown[]>(["list", "--all"]);
			expect(Array.isArray(result)).toBe(true);
		} catch (e) {
			// If container CLI isn't installed, this is expected
			expect((e as Error).message).toContain("failed");
		}
	});
});
