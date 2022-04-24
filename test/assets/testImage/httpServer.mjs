import { createServer } from "net";

const PORT = process.env.PORT;

const main = () => {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
  server.on("connection", (socket) => {
    console.log("Connection received");
    socket.write("Hello world");
  });
};

main();
