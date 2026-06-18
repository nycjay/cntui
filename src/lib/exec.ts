/**
 * Execute a shell command and return parsed JSON output.
 * Throws on non-zero exit code.
 */
export async function exec(args: string[]): Promise<string> {
	const proc = Bun.spawn(["container", ...args], {
		stdout: "pipe",
		stderr: "pipe",
	});
	const stdout = await new Response(proc.stdout).text();
	const stderr = await new Response(proc.stderr).text();
	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		throw new Error(`container ${args.join(" ")} failed: ${stderr.trim()}`);
	}
	return stdout.trim();
}

export async function execJson<T>(args: string[]): Promise<T> {
	const output = await exec([...args, "--format", "json"]);
	return JSON.parse(output) as T;
}
