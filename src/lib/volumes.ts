import type { Volume } from "../types/container.js";
import { exec, execJson } from "./exec.js";

export async function listVolumes(): Promise<Volume[]> {
	return execJson<Volume[]>(["volume", "list"]);
}

export async function createVolume(name: string, size?: string): Promise<void> {
	const args = ["volume", "create", name];
	if (size) args.push("-s", size);
	await exec(args);
}

export async function deleteVolume(name: string): Promise<void> {
	await exec(["volume", "delete", name]);
}

export async function inspectVolume(name: string): Promise<unknown> {
	const output = await exec(["volume", "inspect", name]);
	return JSON.parse(output);
}

export async function pruneVolumes(): Promise<string> {
	return exec(["volume", "prune"]);
}
