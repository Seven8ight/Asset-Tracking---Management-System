import type { IncomingMessage, ServerResponse } from "node:http";
import { sendResponseMessage } from "./Src/Utilities/HttpFunctions.js";
import { RouteController } from "./Routes.js";

export const Router = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  if (requestUrl.pathname.startsWith("/socket.io")) return;
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, DELETE, PATCH",
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "content-type,content-length,authorization,accept",
  );
  response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  response.setHeader("Access-Control-Allow-Credentials", "true");

  if (request.method == "OPTIONS")
    return sendResponseMessage(204, false, "", response);

  try {
    const pathname = pathnames[1];

    if (!pathname)
      return sendResponseMessage(404, true, "Invalid api route", response);

    return RouteController(pathname)(request, response);
  } catch (error) {
    if (error instanceof Error && error.message == "Cannot be found")
      return sendResponseMessage(404, true, "Invalid api route", response);

    sendResponseMessage(404, true, (error as Error).message, response);
  }
};
