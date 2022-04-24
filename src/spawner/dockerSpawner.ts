import { DockerPool } from "@/pool/dockerPool";
import { DockerPoolConstructorInput } from "@/pool/dockerPool.interfaces";
import { getOrCreateLogger } from "@/pool/dockerPool.utils";
import { Logger } from "@/utils/logger.interfaces";
import Dockerode from "dockerode";
import { SpawnerOptions } from "./dockerSpawner.interfaces";
import getPort from "get-port";
import { arrayFromRange } from "@/utils/math";
import { Tuple } from "@/utils/tuple";
import { configurePorts } from "@/helpers/configurePorts";

export class DockerSpawner {
    private readonly pool: DockerPool;
    private readonly logger: Logger;
    private readonly reservedPorts: number[] = [];

    constructor(
        private readonly initialContainerOptions: Partial<Dockerode.ContainerCreateOptions> = {},
        private readonly spawnerOptions: SpawnerOptions = {},
        poolConfig?: DockerPoolConstructorInput,
    ) {
        this.pool = new DockerPool(poolConfig);
        this.logger = getOrCreateLogger(this.spawnerOptions.logger);
    }

    public async spawn(options: Partial<Dockerode.ContainerCreateOptions> = {}) {
        const containerOptions: Dockerode.ContainerCreateOptions = {
            ...this.initialContainerOptions,
            ...options,
        };

        const availablePorts = await this.figureOutPorts(options);

        const runOptionsWithPorts = configurePorts(containerOptions, availablePorts);

        return await this.pool.runWithOptions(runOptionsWithPorts);
    }

    public async spawnMany<T extends number>(
        count: T,
        options:
            | Partial<Dockerode.ContainerCreateOptions>
            | Tuple<Dockerode.ContainerCreateOptions, T> = {},
    ) {
        const containerSpawnPromises: Promise<Dockerode.Container>[] = [];

        for (let i = 0; i < count; i++) {
            const containerOptions = Array.isArray(options) ? options[i] : options;
            const container = this.spawn(containerOptions);
            containerSpawnPromises.push(container);
        }

        const spawnedContainers = await Promise.all(containerSpawnPromises);
        return spawnedContainers;
    }

    public async removeContainers() {
        await this.pool.removeAll();
    }

    private async figureOutPorts(options: Partial<Dockerode.ContainerCreateOptions>) {
        const spawnerPorts = this.spawnerOptions.ports || [];
        const isSettingPortsSet = spawnerPorts.length > 0;
        if (!options.HostConfig?.PortBindings && !isSettingPortsSet) {
            return undefined;
        }

        if (!isSettingPortsSet) {
            return options.HostConfig?.PortBindings;
        }

        this.logger.warn(
            "Container ports were set, but automatical port assignment is enabled. User-set ports will be omitted",
        );

        const spawnerPortPromises = spawnerPorts.map(async (portSettings) => {
            const min = portSettings.portRange?.min || defaultPortFinderSettings.minPort;
            const max = portSettings.portRange?.max || defaultPortFinderSettings.maxPort;
            const { containerPort } = portSettings;

            this.logger.debug(`Looking for open ports for container port ${containerPort}`);
            const possiblePorts = arrayFromRange(min, max);
            const port = await this.findSinglePort(possiblePorts);

            return {
                containerPort,
                hostPort: port,
                type: portSettings.type,
            };
        });

        const availablePorts = await Promise.all(spawnerPortPromises);
        return availablePorts;
    }

    private async findSinglePort(range: number[]): Promise<number> {
        // todo: make it working not only with tcp ports
        const filteredRange = range.filter(
            (possiblePort) => !this.reservedPorts.includes(possiblePort),
        );
        const port = await getPort({ port: filteredRange });

        if (this.reservedPorts.includes(port)) {
            return await this.findSinglePort(filteredRange);
        }

        this.reservedPorts.push(port);
        return port;
    }
}

const defaultPortFinderSettings = {
    minPort: 1000,
    maxPort: 65000,
} as const;
