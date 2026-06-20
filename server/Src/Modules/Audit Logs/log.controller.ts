import type { IncomingMessage, ServerResponse } from "node:http";
import { logsServ } from "../../Data Objects/DTO.js";
import {
  PathnameValidator,
  sendResponseMessage,
} from "../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import { PermissionChecker } from "../../Middleware/PermissionChecker.js";

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

        if (pathname == "department") {
          await PermissionChecker(request, "audit", "View departmental logs");
          requestbody = await service.getDepartmentLogs(user.departmentId);
        } else if (pathname == "all") {
          await PermissionChecker(request, "audit", "View all logs");
          requestbody = await service.getLogs();
        } else {
          await PermissionChecker(request, "audit", "View log");
          requestbody = await service.getLog(pathname);
        }

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
