export interface Container {
	id: string;
	configuration: {
		image: {
			reference: string;
			descriptor: { digest: string };
		};
		publishedPorts: PortMapping[];
		resources: { cpus: number; memoryInBytes: number };
		creationDate: string;
	};
	status: {
		state: string;
		networks: unknown[];
	};
}

export interface PortMapping {
	hostPort: number;
	containerPort: number;
	proto: string;
	hostAddress?: string;
	count?: number;
}

export interface Image {
	id: string;
	configuration: {
		name: string;
		descriptor: { digest: string; size: number };
		creationDate: string;
	};
}

export interface Volume {
	name: string;
	size?: number;
	createdAt?: string;
}

export interface SystemStatus {
	running: boolean;
	version?: string;
	serverVersion?: string;
	build?: string;
	commit?: string;
}

export interface DiskUsage {
	type: string;
	total: number;
	active: number;
	size: string;
	reclaimable: string;
}
