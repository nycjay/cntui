import { exec, execJson } from "./exec.js";

export interface Machine {
	id: string;
	image: string;
	status: string;
	default: boolean;
	cpus?: number;
	memory?: string;
}

export async function listMachines(): Promise<Machine[]> {
	return execJson<Machine[]>(["machine", "list"]);
}

export async function stopMachine(id?: string): Promise<void> {
	const args = ["machine", "stop"];
	if (id) args.push(id);
	await exec(args);
}

export async function deleteMachine(id: string): Promise<void> {
	await exec(["machine", "delete", id]);
}

export async function inspectMachine(id?: string): Promise<unknown> {
	const args = ["machine", "inspect"];
	if (id) args.push(id);
	const output = await exec(args);
	return JSON.parse(output);
}
