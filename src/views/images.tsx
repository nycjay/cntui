import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { ActionMenu } from "../components/action-menu.js";
import { Confirm } from "../components/confirm.js";
import { deleteImage, listImages, pruneImages } from "../lib/images.js";
import { col } from "../lib/table.js";
import { theme } from "../lib/theme.js";
import type { Image } from "../types/container.js";

const bold = createTextAttributes({ bold: true });
const dim = createTextAttributes({ dim: true });

function formatSize(bytes: number): string {
	if (bytes > 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
	if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
	return `${(bytes / 1e3).toFixed(1)} KB`;
}

export function ImagesView() {
	const [images, setImages] = useState<Image[]>([]);
	const [selected, setSelected] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [pendingDelete, setPendingDelete] = useState<string | null>(null);
	const [pendingPrune, setPendingPrune] = useState<
		false | true | "dangling" | "all"
	>(false);

	const refresh = async () => {
		try {
			setImages(await listImages());
			setError(null);
		} catch (e) {
			setError((e as Error).message);
		}
	};

	useEffect(() => {
		refresh();
	}, []);

	const execDelete = async () => {
		if (!pendingDelete) return;
		try {
			await deleteImage(pendingDelete);
		} catch (e) {
			setError((e as Error).message);
		}
		setPendingDelete(null);
		await refresh();
	};

	const execPrune = async (all: boolean) => {
		try {
			await pruneImages(all);
		} catch (e) {
			setError((e as Error).message);
		}
		setPendingPrune(false);
		await refresh();
	};

	useKeyboard((key) => {
		if (pendingDelete || pendingPrune) return;
		if (key.name === "up") setSelected((s) => Math.max(0, s - 1));
		if (key.name === "down")
			setSelected((s) => Math.min(images.length - 1, s + 1));
		if (key.name === "r") {
			refresh();
			return;
		}

		const img = images[selected];
		if (!img) return;

		if (key.name === "d") {
			setPendingDelete(img.configuration.name);
		}
		if (key.name === "p") {
			setPendingPrune(true);
		}
	});

	if (pendingPrune === true) {
		return (
			<ActionMenu
				title="Prune Images"
				actions={[
					{
						key: "d",
						label: "Dangling only (untagged)",
						onSelect: () => setPendingPrune("dangling"),
					},
					{
						key: "a",
						label: "All unused images",
						onSelect: () => setPendingPrune("all"),
					},
				]}
				onClose={() => setPendingPrune(false)}
			/>
		);
	}

	if (pendingPrune === "dangling") {
		return (
			<Confirm
				message="Prune all dangling (untagged) images?"
				onConfirm={() => execPrune(false)}
				onCancel={() => setPendingPrune(false)}
			/>
		);
	}

	if (pendingPrune === "all") {
		return (
			<Confirm
				message="Prune ALL unused images?"
				onConfirm={() => execPrune(true)}
				onCancel={() => setPendingPrune(false)}
			/>
		);
	}

	if (pendingDelete) {
		return (
			<Confirm
				message={`Delete image "${pendingDelete}"?`}
				onConfirm={execDelete}
				onCancel={() => setPendingDelete(null)}
			/>
		);
	}

	if (error) return <text fg={theme.error} content={`Error: ${error}`} />;

	const header = `  ${col("NAME", 45)} ${col("SIZE", 10)} CREATED`;
	const current = images[selected];

	return (
		<box flexDirection="column">
			<text
				fg={theme.text}
				attributes={bold}
				content={`Images (${images.length})`}
			/>
			<text fg={theme.muted} content={header} />
			{images.map((img, i) => {
				const prefix = i === selected ? "▸ " : "  ";
				const line = `${prefix}${col(img.configuration.name, 45)} ${col(formatSize(img.configuration.descriptor.size), 10)} ${img.configuration.creationDate}`;
				return (
					<text
						key={`${img.id}-${i}`}
						fg={i === selected ? theme.selected : theme.text}
						attributes={i === selected ? bold : undefined}
						content={line}
					/>
				);
			})}
			{images.length === 0 && (
				<text fg={theme.muted} attributes={dim} content="  No images found" />
			)}
			{current && (
				<box
					marginTop={1}
					borderStyle="single"
					borderColor={theme.border}
					paddingX={1}
					flexDirection="column"
				>
					<text
						fg={theme.text}
						attributes={bold}
						content={current.configuration.name}
					/>
					<text
						fg={theme.muted}
						content={`Digest: ${current.configuration.descriptor.digest}`}
					/>
					<text
						fg={theme.muted}
						content={`Size: ${formatSize(current.configuration.descriptor.size)} | Created: ${current.configuration.creationDate}`}
					/>
				</box>
			)}
		</box>
	);
}
