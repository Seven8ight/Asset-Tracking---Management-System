import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { assetsService } from "../../../Data Objects/DTO.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";

export const AssetsController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const service = assetsService;

  try {
    const user = AuthValidator(request);

    switch (request.method) {
      case "GET":
        const getPathname = PathnameValidator(pathnames);
        let requestBody: any;

        if (getPathname == "department")
          requestBody = await service.getDepartmentAssets(user.departmentId);
        else requestBody = await service.getAssets(getPathname);

        sendResponseMessage(200, false, requestBody, response);
        break;
      case "POST":
        const postDetails: any = await getRequestBody(request),
          assetsCreation = await service.createAssets(
            user.departmentId,
            postDetails,
          );

        sendResponseMessage(201, false, assetsCreation, response);
        break;
      case "PATCH":
        const assetsId = PathnameValidator(pathnames),
          patchDetails: any = await getRequestBody(request),
          assetsPatch = await service.editAssets(assetsId, patchDetails);

        sendResponseMessage(200, false, assetsPatch, response);
        break;
      case "DELETE":
        const deleteAssetId = PathnameValidator(pathnames);

        await service.deleteAssets(deleteAssetId);

        sendResponseMessage(
          204,
          false,
          "Asset, ${deleteAssetId} deleted successfully",
          response,
        );
        break;
      default:
        sendResponseMessage(400, true, "Invalid HTTP header method", response);
        break;
    }
  } catch (error) {}
};
