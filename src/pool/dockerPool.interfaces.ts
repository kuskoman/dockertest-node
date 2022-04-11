import { Logger, LoggerConstructor } from "@/utils/logger.interfaces";
import Dockerode from "dockerode";

export interface DockerPoolConstructorInput {
    docker?: Dockerode | ConstructorParameters<typeof Dockerode> | string;
    logger?: Logger | LoggerConstructor | false;
}
