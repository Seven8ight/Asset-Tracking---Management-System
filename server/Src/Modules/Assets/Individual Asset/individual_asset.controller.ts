import type { IncomingMessage, ServerResponse } from "node:http";
import { individualAssetServ, logsServ } from "../../../Data Objects/DTO.js";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";

export const IndividualAssetController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const service = individualAssetServ;

  try {
    const user = AuthValidator(request);

    switch (request.method) {
      case "GET":
        const assetsId: string = PathnameValidator(pathnames),
          requestBody = await service.getIndividualAssets(assetsId);

        sendResponseMessage(200, false, requestBody, response);
        break;
      case "PATCH":
        const patchAssetId = PathnameValidator(pathnames),
          patchRequestBody: any = await getRequestBody(request),
          patchAsset = await service.editIndividualAsset(
            patchAssetId,
            patchRequestBody,
          );

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: patchAssetId,
          entity_type: "Individual Asset",
          action: "Individual asset update",
          old_values: {},
          new_values: {},
        });

        sendResponseMessage(200, false, patchAsset, response);
        break;
      case "DELETE":
        const deleteAssetId = PathnameValidator(pathnames);
        await service.deleteIndividualAssets(deleteAssetId);

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: deleteAssetId,
          entity_type: "Individual Asset",
          action: "Individual asset deletion",
          old_values: {},
          new_values: {},
        });

        sendResponseMessage(
          204,
          false,
          `Asset, ${deleteAssetId} deleted successfully`,
          response,
        );
        break;
      default:
        sendResponseMessage(405, true, "Invalid HTTP Header method", response);
        break;
    }
  } catch (error) {
    sendResponseMessage(400, true, (error as Error).message, response);
  }
};
