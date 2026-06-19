import { createTextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { HelpOverlay } from "./components/help-overlay.js";
import { Splash } from "./components/splash.js";
import { StatusBar } from "./components/status-bar.js";
import type { Config } from "./lib/config.js";
import { VERSION } from "./version.js";
import { ContainersView } from "./views/containers.js";
import { ImagesView } from "./views/images.js";
import { MachinesView } from "./views/machines.js";
import { SystemView } from "./views/system.js";
import { VolumesView } from "./views/volumes.js";

type Tab = "containers" | "images" | "volumes" | "machines" | "system";

const TABS: Tab[] = ["containers", "images", "volumes", "machines", "system"];
const bold = createTextAttributes({ bold: true });

export function App({ config }: { config: Config }) {
	const [showSplash, setShowSplash] = useState(true);
	const [activeTab, setActiveTab] = useState<Tab>(config.default_tab);
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setShowSplash(false), 1500);
		return () => clearTimeout(timer);
	}, []);

	useKeyboard((key) => {
		if (showSplash) {
			setShowSplash(false);
			return;
		}
		if (showHelp) return;
		if (key.name === "?") {
			setShowHelp(true);
			return;
		}
		if (key.name === "1") setActiveTab("containers");
		if (key.name === "2") setActiveTab("images");
		if (key.name === "3") setActiveTab("volumes");
		if (key.name === "4") setActiveTab("machines");
		if (key.name === "5") setActiveTab("system");
		if (key.name === "q" || (key.ctrl && key.name === "c")) process.exit(0);
	});

	if (showSplash) return <Splash version={VERSION} />;
	if (showHelp)
		return (
			<HelpOverlay activeTab={activeTab} onClose={() => setShowHelp(false)} />
		);

	return (
		<box
			flexDirection="column"
			width="100%"
			height="100%"
			backgroundColor="#1a1b26"
			shouldFill={true}
		>
			<box flexDirection="row">
				{TABS.map((tab, i) => (
					<text
						key={tab}
						attributes={activeTab === tab ? bold : undefined}
						fg={activeTab === tab ? "cyan" : "white"}
						content={` [${i + 1}] ${tab.charAt(0).toUpperCase() + tab.slice(1)} `}
					/>
				))}
			</box>
			<box flexGrow={1}>
				{activeTab === "containers" && (
					<ContainersView refreshInterval={config.refresh_interval} />
				)}
				{activeTab === "images" && <ImagesView />}
				{activeTab === "volumes" && <VolumesView />}
				{activeTab === "machines" && <MachinesView />}
				{activeTab === "system" && <SystemView />}
			</box>
			<StatusBar activeTab={activeTab} />
		</box>
	);
}
