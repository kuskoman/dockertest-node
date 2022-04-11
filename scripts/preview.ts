#!/usr/bin/env -S node -r tsconfig-paths/register -r ts-node/register

import { DockerPool } from "../src/main";

const main = async () => {
    const pool = new DockerPool();
    await pool.runWithOptions({ repository: "node" });
    await pool.removeAll();
};

main();
