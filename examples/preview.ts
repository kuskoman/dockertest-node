#!/usr/bin/env -S node -r tsconfig-paths/register -r ts-node/register

import { promisify } from "util";
import { DockerPool } from "../src/main";

const main = async () => {
    const pool = new DockerPool();
    await pool.runWithOptions({
        Image: "kuskoman/stupid-http-mock",
        HostConfig: {
            PortBindings: {
                "8080/tcp": [{ HostPort: "8080" }],
            },
        },
    });
    await promisify(setTimeout)(10000);
    await pool.removeAll();
};

main();
