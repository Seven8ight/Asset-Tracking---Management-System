import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../Utilities/HttpFunctions.js";
import { DepartmentService } from "../../Data Objects/DTO.js";

export const DepartmentController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const service = DepartmentService;

  try {
    switch (request.method) {
      case "GET":
        const pathname = PathnameValidator(pathnames);
        let requestBody: any;

        if (pathname == "all") requestBody = service.getAllDepartments();
        else requestBody = service.getDepartment(pathname);

        sendResponseMessage(200, false, requestBody, response);
        break;
      case "POST":
        const postDepartmentDetails: any = await getRequestBody(request),
          newDepartment = service.createDepartment(postDepartmentDetails);

        sendResponseMessage(201, false, newDepartment, response);
        break;
      case "PATCH":
        const patchDepartmentId = PathnameValidator(pathnames),
          patchDepartmentDetails: any = await getRequestBody(request),
          patchedDepartment = await service.editDepartment(
            patchDepartmentId,
            patchDepartmentDetails,
          );

        sendResponseMessage(200, false, patchedDepartment, response);
        break;
      case "DELETE":
        const deleteDepartmentId = PathnameValidator(pathnames);

        await service.deleteDepartment(deleteDepartmentId);

        sendResponseMessage(
          200,
          false,
          `${deleteDepartmentId} department deleted successfully`,
          response,
        );
        break;
      default:
        sendResponseMessage(405, true, "Invalid HTTP header method", response);
        break;
    }
  } catch (error) {
    throw error;
  }
};
