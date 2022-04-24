import { Logger } from "@/utils/logger.interfaces";
import Dockerode from "dockerode";

export interface PortSettings {
    containerPort: number;
    portRange?: { min?: number; max?: number };
    type?: "tcp" | "udp";
}

export interface SpawnerOptions {
    ports?: Array<PortSettings>;
    logger?: Logger;
}

export type PortBindings = Exclude<
    Dockerode.ContainerCreateOptions["HostConfig"],
    undefined
>["PortBindings"];
