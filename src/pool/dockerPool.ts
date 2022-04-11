import { Logger } from "@/utils/logger.interfaces";
import Dockerode from "dockerode";
import { promisify } from "util";
import { DockerPoolConstructorInput, RunOptions } from "./dockerPool.interfaces";
import { getDockerodeInstance, getOrCreateLogger } from "./dockerPool.utils";

export class DockerPool {
    private readonly docker: Dockerode;
    private readonly logger: Logger;
    private readonly containers: Dockerode.Container[] = [];

    constructor({ docker, logger }: DockerPoolConstructorInput = {}) {
        this.docker = getDockerodeInstance(docker);
        this.logger = getOrCreateLogger(logger);
    }

    public async runWithOptions(options: RunOptions) {
        const image = this.parseImage(options.repository, options.tag);
        this.logger.debug(`Parsed image to ${image}`);

        const container = await this.createContainer({ Image: image });
        await this.startContainer(container);
    }

    public async stopAll() {
        const stopPromises = this.containers.map(async (container) => {
            const containerInspection = await container.inspect();
            if (!containerInspection.State.Running) {
                return this.logger.debug(
                    `Container ${container.id} is not running. Skipping stop...`,
                );
            }
            await container.stop();
            this.logger.log(`Container ${container.id} stopped`);
        });

        const stopResults = await Promise.allSettled(stopPromises);
        const failedStops = stopResults.filter((result) => result.status === "rejected");

        if (failedStops.length > 0) {
            this.logger.error(`Failed to stop ${failedStops.length} containers`);
            throw failedStops[0];
        }
    }

    public async removeAll() {
        await promisify(setTimeout)(2000);
        try {
            await this.stopAll();
        } catch (e) {
            this.logger.error("An error occurred when stopping containers");
            this.logger.error(e);
            this.logger.log("Trying to remove containers");
        }

        const removePromises = this.containers.map(async (container) => {
            await container.remove();
            this.logger.log(`Container ${container.id} removed`);
        });

        await Promise.all(removePromises);
        this.logger.log("Successfully removed all containers");
    }

    private parseImage(repository: string, tag = "latest") {
        return `${repository}:${tag}`;
    }

    private async createContainer(opts: Dockerode.ContainerCreateOptions) {
        this.logger.log(`Creating container with image ${opts.Image}`);
        const container = await this.docker.createContainer(opts);
        this.containers.push(container);
        this.logger.log(`Created container ${container.id} with image ${opts.Image}`);

        return container;
    }

    private async startContainer(container: Dockerode.Container) {
        this.logger.log(`Starting container ${container.id}`);
        await container.start();
        this.logger.log(`Started container ${container.id}`);
    }
}
