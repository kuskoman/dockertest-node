#!/usr/bin/env -S node -r tsconfig-paths/register -r ts-node/register

import { DockerSpawner } from "@/main";
import { promisify } from "util";

const main = async () => {
    const spawner = new DockerSpawner(
        { Image: "node" },
        { ports: [{ containerPort: 80, portRange: { min: 1000, max: 3000 } }] },
    );

    await spawner.spawnMany(10);
    await promisify(setTimeout)(100 * 1000);
};

main();
