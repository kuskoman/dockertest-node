import { DockerPool } from "@/pool/dockerPool";
import { DockerPoolConstructorInput } from "@/pool/dockerPool.interfaces";
import { getOrCreateLogger } from "@/pool/dockerPool.utils";
import { Logger } from "@/utils/logger.interfaces";
import Dockerode from "dockerode";
import { SpawnerOptions } from "./dockerSpawner.interfaces";
import getPort from "get-port";
import { arrayFromRange } from "@/utils/math";

export class DockerSpawner {
    private readonly pool: DockerPool;
    private readonly logger: Logger;
    private readonly reservedPorts: number[] = [];

    constructor(
        poolConfig: DockerPoolConstructorInput,
        private readonly spawnerOptions: SpawnerOptions = {},
        private readonly initialContainerOptions: Partial<Dockerode.ContainerCreateOptions> = {},
    ) {
        this.pool = new DockerPool(poolConfig);
        this.logger = getOrCreateLogger(this.spawnerOptions.logger);
    }

    public async spawn(options: Partial<Dockerode.ContainerCreateOptions> = {}) {
        const containerOptions: Dockerode.ContainerCreateOptions = {
            ...this.initialContainerOptions,
            ...options,
        };

        const ExposedPorts = await this.figureOutPorts(options);

        return await this.pool.runWithOptions({ ...containerOptions, ExposedPorts });
    }

    private async figureOutPorts(
        options: Partial<Dockerode.ContainerCreateOptions>,
    ): Promise<Dockerode.ContainerCreateOptions["ExposedPorts"]> {
        const spawnerPorts = this.spawnerOptions.ports || [];
        const isSettingPortsSet = spawnerPorts.length > 0;
        if (!options.ExposedPorts && !isSettingPortsSet) {
            return undefined;
        }

        if (!isSettingPortsSet) {
            return options.ExposedPorts;
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
                port,
            };
        });

        const availablePorts = await Promise.all(spawnerPortPromises);
        return availablePorts.reduce(
            (acc, curr) => ({ ...acc, [curr.port]: curr.containerPort }),
            {},
        );
    }

    private async findSinglePort(range: number[]): Promise<number> {
        const port = await getPort({ port: range, exclude: this.reservedPorts });

        if (this.reservedPorts.includes(port)) {
            return await this.findSinglePort(range);
        }

        this.reservedPorts.push(port);
        return port;
    }
}

const defaultPortFinderSettings = {
    minPort: 1000,
    maxPort: 65000,
} as const;