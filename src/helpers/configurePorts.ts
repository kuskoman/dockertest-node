import Dockerode from "dockerode";
import { PortEntry } from "./configurePorts.interfaces";

export const parsePorts = (ports: PortEntry | Array<PortEntry>) => {
    const portsArray = Array.isArray(ports) ? ports : [ports];

    return portsArray.reduce((acc, curr) => {
        const type = curr.type || "tcp";
        const containerPortFullName = `${curr.containerPort}/${type}`;

        return { ...acc, [containerPortFullName]: [{ HostPort: curr.hostPort.toString() }] };
    }, {});
};

export const configurePorts = (
    createOptions: Dockerode.ContainerCreateOptions,
    ports: PortEntry | Array<PortEntry>,
): Dockerode.ContainerCreateOptions => {
    const parsedPorts = parsePorts(ports);

    return {
        ...createOptions,
        HostConfig: {
            ...(createOptions.HostConfig || {}),
            PortBindings: {
                ...(createOptions.HostConfig?.PortBindings || {}),
                ...parsedPorts,
            },
        },
    };
};
