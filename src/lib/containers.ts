import type { Container } from "../types/container.js";
import { exec, execJson } from "./exec.js";

export async function listContainers(all = true): Promise<Container[]> {
	const args = ["list"];
	if (all) args.push("--all");
	return execJson<Container[]>(args);
}

export async function startContainer(id: string): Promise<void> {
	await exec(["start", id]);
}

export async function stopContainer(id: string): Promise<void> {
	await exec(["stop", id]);
}

export async function deleteContainer(
	id: string,
	force = false,
): Promise<void> {
	const args = ["delete", id];
	if (force) args.push("--force");
	await exec(args);
}

export async function inspectContainer(id: string): Promise<unknown> {
	const output = await exec(["inspect", id]);
	return JSON.parse(output);
}

export async function getContainerLogs(
	id: string,
	lines?: number,
): Promise<string> {
	const args = ["logs", id];
	if (lines) args.push("-n", String(lines));
	return exec(args);
}

export async function pruneContainers(): Promise<string> {
	return exec(["prune"]);
}

export async function execInContainer(
	id: string,
	command = "/bin/sh",
): Promise<void> {
	const proc = Bun.spawn(["container", "exec", "-it", id, command], {
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit",
	});
	await proc.exited;
}

export async function getContainerStats(id?: string): Promise<string> {
	const args = ["stats", "--no-stream", "--format", "json"];
	if (id) args.push(id);
	return exec(args);
}
