import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../Utilities/HttpFunctions.js";
import { DepartmentService, logsServ } from "../../Data Objects/DTO.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import { PermissionChecker } from "../../Middleware/PermissionChecker.js";

export const DepartmentController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const service = DepartmentService;

  try {
    const user = AuthValidator(request);

    switch (request.method) {
      case "GET":
        const pathname = PathnameValidator(pathnames);
        let requestBody: any;

        if (pathname == "all") {
          await PermissionChecker(
            request,
            "department",
            "View all departments",
          );
          requestBody = await service.getAllDepartments();
        } else if (pathname == "allusers") {
          await PermissionChecker(
            request,
            "department",
            "View all department users",
          );
          requestBody = await service.getUsersInDepartments(user.departmentId);
        } else {
          requestBody = await service.getDepartment(pathname);
        }

        sendResponseMessage(200, false, requestBody, response);
        break;
      case "POST":
        await PermissionChecker(request, "department", "Department creation");

        const postDepartmentDetails: any = await getRequestBody(request),
          newDepartment = await service.createDepartment(postDepartmentDetails);

        await logsServ.createLog(newDepartment.id, user.userId, {
          entity_id: newDepartment.id,
          entity_type: "Department entity",
          action: "Creating department",
          old_values: {},
          new_values: newDepartment,
        });

        sendResponseMessage(201, false, newDepartment, response);
        break;
      case "PATCH":
        await PermissionChecker(request, "department", "Department update");

        const patchDepartmentId = PathnameValidator(pathnames),
          patchDepartmentDetails: any = await getRequestBody(request),
          originalDepartment = await service.getDepartment(patchDepartmentId),
          patchedDepartment = await service.editDepartment(
            patchDepartmentId,
            patchDepartmentDetails,
          );

        await logsServ.createLog(patchDepartmentId, user.userId, {
          entity_id: patchDepartmentId,
          entity_type: "Department entity",
          action: "Editing department",
          old_values: originalDepartment,
          new_values: patchedDepartment,
        });

        sendResponseMessage(200, false, patchedDepartment, response);
        break;
      case "DELETE":
        await PermissionChecker(request, "department", "Department deletion");
        const deleteDepartmentId = PathnameValidator(pathnames);

        await logsServ.createLog(deleteDepartmentId, user.userId, {
          entity_id: deleteDepartmentId,
          entity_type: "Department entity",
          action: "Deleting department",
          old_values: await service.getDepartment(deleteDepartmentId),
          new_values: {},
        });

        await service.deleteDepartment(deleteDepartmentId);

        sendResponseMessage(
          204,
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
    sendResponseMessage(400, true, (error as Error).message, response);
  }
};
