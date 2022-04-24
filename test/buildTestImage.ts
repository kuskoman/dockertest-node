#!/usr/bin/env -S node -r tsconfig-paths/register -r ts-node/register

import { DockerPool } from "@/main";
import { join } from "path";
import { testDockerodeConfig, testImageName } from "./config";

const build = async () => {
    const skipImageBuildVar = process.env.SKIP_IMAGE_BUILD;
    if (skipImageBuildVar && skipImageBuildVar !== "0") {
        console.log("Skipping image build");
        return;
    }

    const pool = new DockerPool(testDockerodeConfig);
    const assetsPath = join(__dirname, "assets", "testImage");
    const dockerfile = "Dockerfile";
    const serverFile = "httpServer.mjs";
    await pool.buildImage(
        { context: assetsPath, src: [dockerfile, serverFile] },
        { t: testImageName },
    );
};

build();
