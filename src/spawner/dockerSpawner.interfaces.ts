import { Logger } from "@/utils/logger.interfaces";

export interface PortSettings {
    containerPort: number;
    portRange?: { min?: number; max?: number };
}

export interface SpawnerOptions {
    ports?: Array<PortSettings>;
    logger?: Logger;
}
