import {
  Server,
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { SERVER_PORT } from "./Src/Config/Env.js";
import { Info } from "./Src/Utilities/Logger.js";
import { Router } from "./Router.js";
import { SocketIO } from "./Src/Modules/Socket/socket.service.js";

const httpServer: Server<typeof IncomingMessage, typeof ServerResponse> =
    createServer(
      (request: IncomingMessage, response: ServerResponse<IncomingMessage>) =>
        Router(request, response),
    ),
  ioServer = new SocketIO(httpServer);

httpServer.listen(SERVER_PORT, () => {
  ioServer.establishConnection();
  Info(`Server is up and running at port, ${SERVER_PORT}`);
});

process.on("uncaughtException", (error: Error) => {
  process.stdout.write(`${error.message}`);
});
process.on("unhandledRejection", (reason) => {
  if (reason instanceof Error) process.stdout.write(`${reason.message}`);
  else process.stdout.write(`${reason}`);
});
