import type { DiskUsage, SystemStatus } from "../types/container.js";
import { exec, execJson } from "./exec.js";

export const MIN_VERSION = "1.0.0";

export async function getSystemStatus(): Promise<SystemStatus> {
	try {
		const result = await execJson<
			Array<{
				appName: string;
				version: string;
				buildType: string;
				commit: string;
			}>
		>(["system", "version"]);
		const cli = result.find((c) => c.appName === "container");
		const server = result.find((c) => c.appName === "container-apiserver");
		return {
			running: !!server,
			version: cli?.version,
			serverVersion: server?.version,
			build: server?.buildType ?? cli?.buildType,
			commit: server?.commit ?? cli?.commit,
		};
	} catch {
		return { running: false };
	}
}

/**
 * Compare semver strings. Returns -1 if a < b, 0 if equal, 1 if a > b.
 */
export function compareSemver(a: string, b: string): number {
	const pa = a.split(".").map(Number);
	const pb = b.split(".").map(Number);
	for (let i = 0; i < 3; i++) {
		if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
		if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
	}
	return 0;
}

export function checkVersionCompatibility(version: string | undefined): {
	ok: boolean;
	message?: string;
} {
	if (!version) return { ok: true }; // can't check, don't block
	if (compareSemver(version, MIN_VERSION) < 0) {
		return {
			ok: false,
			message: `container CLI v${version} detected. ctui requires v${MIN_VERSION}+. Upgrade: https://github.com/apple/container/releases`,
		};
	}
	return { ok: true };
}

export async function startSystem(): Promise<void> {
	await exec(["system", "start", "--enable-kernel-install"]);
}

export async function stopSystem(): Promise<void> {
	await exec(["system", "stop"]);
}

export async function getDiskUsage(): Promise<DiskUsage> {
	return execJson<DiskUsage>(["system", "df"]);
}

export async function isContainerInstalled(): Promise<boolean> {
	try {
		const proc = Bun.spawn(["which", "container"], { stdout: "pipe" });
		await proc.exited;
		return proc.exitCode === 0;
	} catch {
		return false;
	}
}
