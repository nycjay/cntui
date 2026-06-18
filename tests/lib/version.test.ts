import { describe, expect, test } from "bun:test";
import {
	checkVersionCompatibility,
	compareSemver,
} from "../../src/lib/system.js";

describe("compareSemver", () => {
	test("equal versions", () => {
		expect(compareSemver("1.0.0", "1.0.0")).toBe(0);
	});
	test("a < b", () => {
		expect(compareSemver("0.12.0", "1.0.0")).toBe(-1);
	});
	test("a > b", () => {
		expect(compareSemver("1.1.0", "1.0.0")).toBe(1);
	});
	test("patch comparison", () => {
		expect(compareSemver("1.0.1", "1.0.0")).toBe(1);
	});
});

describe("checkVersionCompatibility", () => {
	test("passes for 1.0.0", () => {
		expect(checkVersionCompatibility("1.0.0").ok).toBe(true);
	});
	test("passes for versions above minimum", () => {
		expect(checkVersionCompatibility("1.2.3").ok).toBe(true);
	});
	test("fails for pre-1.0 versions", () => {
		const result = checkVersionCompatibility("0.12.0");
		expect(result.ok).toBe(false);
		expect(result.message).toContain("v1.0.0");
	});
	test("passes when version is undefined", () => {
		expect(checkVersionCompatibility(undefined).ok).toBe(true);
	});
});
