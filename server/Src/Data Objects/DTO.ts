import { Database } from "../Config/Db.js";
import { AssetRepo } from "../Modules/Assets/Individual Asset/individual_asset.repository.js";
import { AssetServ } from "../Modules/Assets/Individual Asset/individual_asset.service.js";
import { AssetAssignmentRepo } from "../Modules/Assets/Assignments/asset_assignment.repository.js";
import { AssetAssignmentServ } from "../Modules/Assets/Assignments/asset_assignment.service.js";
import { AssetsRepo } from "../Modules/Assets/Definition/asset.repository.js";
import { AssetsServ } from "../Modules/Assets/Definition/asset.service.js";
import { LogRepo } from "../Modules/Audit Logs/log.repository.js";
import { LogServ } from "../Modules/Audit Logs/log.service.js";
import { DepartmentRepo } from "../Modules/Department/department.repository.js";
import { DepartmentServ } from "../Modules/Department/department.service.js";
import { PermissionRepo } from "../Modules/Permissions/Definition/permission.repository.js";
import { PermissionService } from "../Modules/Permissions/Definition/permission.service.js";
import { RolePermissionRepo } from "../Modules/Permissions/Role Permissions/role_permission.repository.js";
import { RolePermissionServ } from "../Modules/Permissions/Role Permissions/role_permission.service.js";
import { RoleRepo } from "../Modules/Roles/Definition/role.repository.js";
import { Roleservice } from "../Modules/Roles/Definition/role.service.js";
import { UserRoleRepo } from "../Modules/Roles/User Roles/user_role.repository.js";
import { UserRolesServ } from "../Modules/Roles/User Roles/user_role.service.js";
import { UserRepo } from "../Modules/Users/user.repository.js";
import { UserServ } from "../Modules/Users/user.service.js";

const Db = new Database();

const departmentRepo = new DepartmentRepo(Db),
  assetsRepo = new AssetsRepo(Db),
  assetRepo = new AssetRepo(Db),
  assetAssignmentsRepo = new AssetAssignmentRepo(Db),
  userRepo = new UserRepo(Db),
  rolesRepo = new RoleRepo(Db),
  userRolesRepo = new UserRoleRepo(Db),
  permissionRepo = new PermissionRepo(Db),
  rolePermissionRepo = new RolePermissionRepo(Db),
  logsRepo = new LogRepo(Db);

export const DepartmentService = new DepartmentServ(departmentRepo),
  assetsService = new AssetsServ(assetsRepo),
  assetAssignmentsServ = new AssetAssignmentServ(assetAssignmentsRepo),
  assetServ = new AssetServ(assetRepo),
  userServ = new UserServ(userRepo),
  rolesService = new Roleservice(rolesRepo),
  userRolesServ = new UserRolesServ(userRolesRepo),
  permissionServ = new PermissionService(permissionRepo),
  rolePermissionServ = new RolePermissionServ(rolePermissionRepo),
  logsServ = new LogServ(logsRepo);
