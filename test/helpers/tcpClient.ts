import { Socket } from "net";

export const receiveTcpData = (host: string, port: number): Promise<Buffer> => {
    const sock = new Socket();
    sock.connect(port, host);

    return new Promise((resolve, reject) => {
        sock.on("error", (err) => {
            throw reject(err);
        });
        sock.on("data", (data) => {
            sock.destroy();
            resolve(data);
        });
    });
};
