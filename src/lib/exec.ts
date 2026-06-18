/**
 * Execute a container CLI command and return stdout.
 * Throws on non-zero exit code or if the binary is not found.
 */
export async function exec(args: string[]): Promise<string> {
	try {
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
	} catch (e) {
		if (e instanceof Error && e.message.includes("failed:")) throw e;
		throw new Error(
			`container ${args.join(" ")} failed: ${(e as Error).message}`,
		);
	}
}

export async function execJson<T>(args: string[]): Promise<T> {
	const output = await exec([...args, "--format", "json"]);
	return JSON.parse(output) as T;
}
