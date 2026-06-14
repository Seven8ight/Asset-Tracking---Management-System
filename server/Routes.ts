import type { IncomingMessage, ServerResponse } from "node:http";
import { UserController } from "./Src/Modules/Users/user.controller.js";
import { RoleController } from "./Src/Modules/Roles/Definition/role.controller.js";
import { UserRoleController } from "./Src/Modules/Roles/User Roles/user_role.controller.js";
import { PermissionController } from "./Src/Modules/Permissions/Definition/permission.controller.js";
import { RolePermissionController } from "./Src/Modules/Permissions/Role Permissions/role_permission.controller.js";
import { DepartmentController } from "./Src/Modules/Department/department.controller.js";
import { AssetController } from "./Src/Modules/Assets/Definition/asset.controller.js";
import { AssignmentsController } from "./Src/Modules/Assets/Assignments/asset_assignment.controller.js";
import { IndividualAssetController } from "./Src/Modules/Assets/Individual Asset/individual_asset.controller.js";
import { AuditController } from "./Src/Modules/Audit Logs/log.controller.js";
import { AuthenticationController } from "./Src/Modules/Authentication/authentication.controller.js";

type Controller = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => Promise<void>;

type Route = {
  name: string;
  controller: (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>,
  ) => Promise<void>;
};

const routes: Route[] = [
  {
    name: "users",
    controller: UserController,
  },
  {
    name: "roles",
    controller: RoleController,
  },
  {
    name: "userroles",
    controller: UserRoleController,
  },
  {
    name: "permissions",
    controller: PermissionController,
  },
  {
    name: "rolepermissions",
    controller: RolePermissionController,
  },
  {
    name: "department",
    controller: DepartmentController,
  },
  {
    name: "asset",
    controller: AssetController,
  },
  {
    name: "individualassets",
    controller: IndividualAssetController,
  },
  {
    name: "assignments",
    controller: AssignmentsController,
  },
  {
    name: "audit",
    controller: AuditController,
  },
  {
    name: "auth",
    controller: AuthenticationController,
  },
];

export function RouteController(routeName: string): Controller {
  const routeMap = routes.find(
    (route) => route.name == routeName.toLowerCase(),
  );

  if (!routeMap) throw new Error("Cannot be found");

  return routeMap.controller;
}
