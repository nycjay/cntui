import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { Confirm } from "../components/confirm.js";
import { pruneContainers } from "../lib/containers.js";
import { pruneImages } from "../lib/images.js";
import {
	getDiskUsage,
	getSystemStatus,
	startSystem,
	stopSystem,
} from "../lib/system.js";
import { theme } from "../lib/theme.js";
import { pruneVolumes } from "../lib/volumes.js";
import type { DiskUsage, SystemStatus } from "../types/container.js";

const bold = createTextAttributes({ bold: true });

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const units = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

export function SystemView() {
	const [status, setStatus] = useState<SystemStatus | null>(null);
	const [diskUsage, setDiskUsage] = useState<DiskUsage | null>(null);
	const [confirmPrune, setConfirmPrune] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refresh = async () => {
		const [statusResult, diskResult] = await Promise.allSettled([
			getSystemStatus(),
			getDiskUsage(),
		]);
		if (statusResult.status === "fulfilled") setStatus(statusResult.value);
		setDiskUsage(diskResult.status === "fulfilled" ? diskResult.value : null);
	};

	const pruneAll = async () => {
		const results = await Promise.allSettled([
			pruneContainers(),
			pruneImages(),
			pruneVolumes(),
		]);
		const errors = results
			.filter((r) => r.status === "rejected")
			.map((r) => (r as PromiseRejectedResult).reason.message);
		if (errors.length > 0) setError(errors.join("; "));
		setConfirmPrune(false);
		await refresh();
	};

	useEffect(() => {
		refresh();
	}, []);

	useKeyboard(async (key) => {
		if (confirmPrune) return;
		if (key.name === "escape" && error) {
			setError(null);
			return;
		}
		if (key.name === "s") {
			try {
				if (status?.running) await stopSystem();
				else await startSystem();
			} catch (e) {
				setError((e as Error).message);
			}
			await refresh();
		}
		if (key.name === "p" && diskUsage) {
			setConfirmPrune(true);
		}
		if (key.name === "r") await refresh();
	});

	if (confirmPrune) {
		return (
			<Confirm
				message="Prune all stopped containers, unused images, and unused volumes?"
				onConfirm={pruneAll}
				onCancel={() => setConfirmPrune(false)}
			/>
		);
	}

	const totalReclaimable = diskUsage
		? diskUsage.containers.reclaimable +
			diskUsage.images.reclaimable +
			diskUsage.volumes.reclaimable
		: 0;

	return (
		<box flexDirection="column">
			<text
				fg={theme.text}
				attributes={bold}
				content="Apple Container Runtime"
			/>
			<text content="" />
			{error && (
				<text
					fg={theme.error}
					content={`Error: ${error} (press Esc to dismiss)`}
				/>
			)}
			<text
				fg={status?.running ? theme.success : theme.error}
				content={`  Service:     ${status?.running ? "Running" : "Stopped"}`}
			/>
			{status?.version && (
				<text fg={theme.text} content={`  CLI Version: ${status.version}`} />
			)}
			{diskUsage && (
				<box flexDirection="column" marginTop={1}>
					<text fg={theme.text} attributes={bold} content="Disk Usage" />
					<text content="" />
					<text
						fg={theme.text}
						content={`  Containers:  ${diskUsage.containers.total} total, ${diskUsage.containers.active} active (${formatBytes(diskUsage.containers.sizeInBytes)})`}
					/>
					<text
						fg={theme.text}
						content={`  Images:      ${diskUsage.images.total} total, ${diskUsage.images.active} active (${formatBytes(diskUsage.images.sizeInBytes)})`}
					/>
					<text
						fg={theme.text}
						content={`  Volumes:     ${diskUsage.volumes.total} total, ${diskUsage.volumes.active} active (${formatBytes(diskUsage.volumes.sizeInBytes)})`}
					/>
					{totalReclaimable > 0 && (
						<>
							<text content="" />
							<text
								fg={theme.muted}
								content={`  Reclaimable: ${formatBytes(totalReclaimable)} — press p to prune`}
							/>
						</>
					)}
				</box>
			)}
		</box>
	);
}
