import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { assetService, logsServ } from "../../../Data Objects/DTO.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";

export const AssetController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const service = assetService;

  try {
    const user = AuthValidator(request);

    switch (request.method) {
      case "GET":
        const getPathname = PathnameValidator(pathnames);
        let requestBody: any;

        if (getPathname == "department")
          requestBody = await service.getDepartmentAssets(user.departmentId);
        else requestBody = await service.getAsset(getPathname);

        sendResponseMessage(200, false, requestBody, response);
        break;
      case "POST":
        const postDetails: any = await getRequestBody(request),
          assetsCreation = await service.createAsset(
            user.departmentId,
            postDetails,
          );

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: assetsCreation.id,
          entity_type: "Asset item",
          action: "Creating an asset",
          old_values: {},
          new_values: assetsCreation,
        });

        sendResponseMessage(201, false, assetsCreation, response);
        break;
      case "PATCH":
        const assetsId = PathnameValidator(pathnames),
          patchDetails: any = await getRequestBody(request),
          beforeUpdateAsset = await service.getAsset(assetsId),
          assetsPatch = await service.editAsset(assetsId, patchDetails);

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: assetsId,
          entity_type: "Asset item",
          action: "Editing an asset",
          old_values: beforeUpdateAsset,
          new_values: assetsPatch,
        });

        sendResponseMessage(200, false, assetsPatch, response);
        break;
      case "DELETE":
        const deleteAssetId = PathnameValidator(pathnames),
          beforeDeleteAsset = await service.getAsset(deleteAssetId);

        await service.deleteAsset(deleteAssetId);

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: deleteAssetId,
          entity_type: "Asset item",
          action: "Deleting an asset",
          old_values: beforeDeleteAsset,
          new_values: {},
        });

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
  } catch (error) {
    sendResponseMessage(400, true, (error as Error).message, response);
  }
};
