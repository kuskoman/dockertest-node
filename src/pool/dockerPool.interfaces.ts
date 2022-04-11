import { Logger, LoggerConstructor } from "@/utils/logger.interfaces";
import Dockerode from "dockerode";

export interface DockerPoolConstructorInput {
    docker?: Dockerode | ConstructorParameters<typeof Dockerode> | string;
    logger?: Logger | LoggerConstructor | false;
}

export interface RunOptions {
    hostname?: string;
    name?: string;
    repository: string;
    tag?: string;
    env?: Record<string, string>;
    entrypoint?: string[];
    cmd?: string[];
}
