import type { IncomingMessage, ServerResponse } from "node:http";
import { logsServ } from "../../Data Objects/DTO.js";
import {
  PathnameValidator,
  sendResponseMessage,
} from "../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";

export const AuditController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const service = logsServ;

  try {
    const user = AuthValidator(request);

    switch (request.method) {
      case "GET":
        const pathname = PathnameValidator(pathnames);
        let requestbody: any;

        if (pathname == "department")
          requestbody = await service.getDepartmentLogs(user.departmentId);
        else requestbody = await service.getLog(pathname);

        sendResponseMessage(200, false, requestbody, response);

        break;
      default:
        sendResponseMessage(405, true, "Invalid HTTP header method", response);
        break;
    }
  } catch (error) {
    sendResponseMessage(400, true, (error as Error).message, response);
  }
};
