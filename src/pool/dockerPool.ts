import { Logger } from "@/utils/logger.interfaces";
import Dockerode from "dockerode";
import { DockerPoolConstructorInput } from "./dockerPool.interfaces";
import { getDockerodeInstance, getOrCreateLogger } from "./dockerPool.utils";

export class DockerPool {
    private readonly docker: Dockerode;
    private readonly logger: Logger;
    private readonly containers: Dockerode.Container[] = [];

    constructor({ docker, logger }: DockerPoolConstructorInput = {}) {
        this.docker = getDockerodeInstance(docker);
        this.logger = getOrCreateLogger(logger);
    }

    public async runWithOptions(options: Dockerode.ContainerCreateOptions) {
        const container = await this.createContainer(options);
        await this.startContainer(container);

        return container;
    }

    public async stopAll() {
        const stopPromises = this.containers.map(async (container) => {
            await this.stopContainer(container);
        });

        const stopResults = await Promise.allSettled(stopPromises);
        const failedStops = stopResults.filter((result) => result.status === "rejected");

        if (failedStops.length > 0) {
            this.logger.error(`Failed to stop ${failedStops.length} containers`);
            throw failedStops[0];
        }
    }

    public async removeAll() {
        try {
            await this.stopAll();
        } catch (e) {
            this.logger.error("An error occurred when stopping containers");
            this.logger.error(e);
            this.logger.log("Trying to remove containers");
        }

        const removePromises = this.containers.map(async (container) => {
            await this.removeContainer(container);
        });

        await Promise.all(removePromises);
        this.logger.log("Successfully removed all containers");
    }

    public async stopContainer(container: Dockerode.Container) {
        const containerInspection = await container.inspect();
        if (!containerInspection.State.Running) {
            return this.logger.debug(`Container ${container.id} is not running. Skipping stop...`);
        }
        await container.stop();
        this.logger.log(`Container ${container.id} stopped`);
    }

    public async removeContainer(container: Dockerode.Container) {
        await container.remove();
        this.logger.log(`Container ${container.id} removed`);
    }

    public async buildImage(
        ctx: Dockerode.ImageBuildContext,
        options: Dockerode.ImageBuildOptions,
    ) {
        const stream = await this.docker.buildImage(ctx, options);
        stream.pipe(process.stdout);

        return new Promise((resolve) => {
            stream.on("end", resolve);
        });
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
        await container.wait();
        this.logger.log(`Started container ${container.id}`);
    }
}
