import { configurePorts } from "@/helpers/configurePorts";
import { DockerPool } from "@/main";
import Dockerode from "dockerode";
import getPort from "get-port";
import { testDockerodeConfig, testImageName } from "./config";
import { receiveTcpData } from "./helpers/tcpClient";

const containerPort = 1234;
const imageName = testImageName;

describe(DockerPool.name, () => {
    const pool = new DockerPool(testDockerodeConfig);

    afterAll(async () => {
        await pool.removeAll();
    });

    it("should properly build and create container with example app", async () => {
        const port = await getPort();
        console.log(`Assigned host port ${port} to container`);

        const baseRunOptions: Dockerode.ContainerCreateOptions = {
            Image: imageName,
        };
        const runConfig = configurePorts(baseRunOptions, {
            hostPort: port,
            containerPort: containerPort,
        });

        await pool.runWithOptions(runConfig);

        const receivedData = await receiveTcpData("localhost", port);
        const stringifiedTcpData = Buffer.from(receivedData).toString("utf-8");

        expect(stringifiedTcpData).toBe("Hello world");
    });
});
