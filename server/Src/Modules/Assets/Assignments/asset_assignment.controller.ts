import { type IncomingMessage, type ServerResponse } from "node:http";
import { assetAssignmentsServ, logsServ } from "../../../Data Objects/DTO.js";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";

export const AssignmentsController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const service = assetAssignmentsServ;

  try {
    const user = AuthValidator(request);

    switch (request.method) {
      case "GET":
        const getPathname = PathnameValidator(pathnames);
        let requestBody: any;

        if (getPathname == "department")
          requestBody = await service.getDepartmentAssignments(
            user.departmentId,
          );
        else requestBody = await service.getAssignments(getPathname);

        sendResponseMessage(200, false, requestBody, response);
        break;
      case "POST":
        const postAssetId = PathnameValidator(pathnames);

        const responseBody = await service.assignAsset(
          postAssetId,
          user.departmentId,
          user.userId,
        );

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: postAssetId,
          entity_type: "Asset assignment entity",
          action: "Asset assignment to user",
          old_values: {},
          new_values: responseBody,
        });

        sendResponseMessage(201, false, responseBody, response);
        break;
      case "PATCH":
        const patchAssignmentId = PathnameValidator(pathnames),
          patchReqBody: any = await getRequestBody(request);

        const priorResponseBody =
            await service.getAssignments(patchAssignmentId),
          patchResponseBody = await service.editAssignment(
            patchAssignmentId,
            patchReqBody,
          );

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: patchAssignmentId,
          entity_type: "Asset assignment entity",
          action: "Change of assignment to user",
          old_values: priorResponseBody,
          new_values: patchResponseBody,
        });

        sendResponseMessage(200, false, patchResponseBody, response);
        break;
      default:
        sendResponseMessage(405, true, "Invalid HTTP Header method", response);
        break;
    }
  } catch (error) {
    sendResponseMessage(400, true, (error as Error).message, response);
  }
};
