import type { Image } from "../types/container.js";
import { exec, execJson } from "./exec.js";

export async function listImages(): Promise<Image[]> {
	return execJson<Image[]>(["image", "list"]);
}

export async function pullImage(reference: string): Promise<void> {
	await exec(["image", "pull", reference]);
}

export async function deleteImage(reference: string): Promise<void> {
	await exec(["image", "delete", reference]);
}

export async function inspectImage(reference: string): Promise<unknown> {
	const output = await exec(["image", "inspect", reference]);
	return JSON.parse(output);
}

export async function pruneImages(all = false): Promise<string> {
	const args = ["image", "prune"];
	if (all) args.push("--all");
	return exec(args);
}
