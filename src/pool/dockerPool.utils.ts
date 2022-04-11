import { DefaultLogger, VoidLogger } from "@/utils/logger";
import { Logger } from "@/utils/logger.interfaces";
import Dockerode from "dockerode";
import { DockerPoolConstructorInput } from "./dockerPool.interfaces";

type ConstructorParams = DockerPoolConstructorInput;

export const getDockerodeInstance = (input: ConstructorParams["docker"]): Dockerode => {
    if (!input) {
        return new Dockerode();
    }

    if (typeof input === "string") {
        return new Dockerode({ host: input });
    }

    if (input instanceof Dockerode) {
        return input;
    }

    return new Dockerode(...input);
};

export const getOrCreateLogger = (logger: ConstructorParams["logger"]): Logger => {
    if (logger === false) {
        return new VoidLogger();
    }

    if (!logger) {
        return new DefaultLogger();
    }

    if (typeof logger === "function") {
        return new logger();
    }

    return logger;
};
