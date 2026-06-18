import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { deleteImage, listImages } from "../lib/images.js";
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

	const refresh = async () => {
		try {
			setImages(await listImages());
			setError(null);
		} catch (e) {
			setError((e as Error).message);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
	useEffect(() => {
		refresh();
	}, []);

	useKeyboard(async (key) => {
		if (key.name === "up") setSelected((s) => Math.max(0, s - 1));
		if (key.name === "down")
			setSelected((s) => Math.min(images.length - 1, s + 1));
		if (key.name === "r") await refresh();

		const img = images[selected];
		if (!img) return;

		if (key.name === "d") {
			await deleteImage(img.configuration.name);
			await refresh();
		}
	});

	if (error) return <text fg="red" content={`Error: ${error}`} />;

	const header = `  ${"NAME".padEnd(45)} ${"SIZE".padEnd(12)} CREATED`;

	return (
		<box flexDirection="column">
			<text
				fg="default"
				attributes={bold}
				content={`Images (${images.length}) — [d] delete [r] refresh`}
			/>
			<text fg="default" attributes={bold} content={header} />
			{images.map((img, i) => {
				const prefix = i === selected ? "▸ " : "  ";
				const line = `${prefix}${img.configuration.name.padEnd(45)} ${formatSize(img.configuration.descriptor.size).padEnd(12)} ${img.configuration.creationDate}`;
				return (
					<text
						key={img.id}
						fg={i === selected ? "green" : "default"}
						attributes={i === selected ? bold : undefined}
						content={line}
					/>
				);
			})}
			{images.length === 0 && (
				<text fg="default" attributes={dim} content=" No images found" />
			)}
		</box>
	);
}
