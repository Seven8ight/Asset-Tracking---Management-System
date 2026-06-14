import { Database } from "../Config/Db.js";
import { IndividualAssetRepo } from "../Modules/Assets/Individual Asset/individual_asset.repository.js";
import { IndividualAssetServ } from "../Modules/Assets/Individual Asset/individual_asset.service.js";
import { AssetAssignmentRepo } from "../Modules/Assets/Assignments/asset_assignment.repository.js";
import { AssetAssignmentServ } from "../Modules/Assets/Assignments/asset_assignment.service.js";
import { AssetRepo } from "../Modules/Assets/Definition/asset.repository.js";
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
import { AuthenticationRepo } from "../Modules/Authentication/authentication.repository.js";
import { AuthenticationService } from "../Modules/Authentication/authentication.service.js";

const Db = new Database();

const departmentRepo = new DepartmentRepo(Db),
  assetRepo = new AssetRepo(Db),
  individualAssetRepo = new IndividualAssetRepo(Db),
  assetAssignmentsRepo = new AssetAssignmentRepo(Db),
  userRepo = new UserRepo(Db),
  rolesRepo = new RoleRepo(Db),
  userRolesRepo = new UserRoleRepo(Db),
  permissionRepo = new PermissionRepo(Db),
  rolePermissionRepo = new RolePermissionRepo(Db),
  logsRepo = new LogRepo(Db),
  authRepo = new AuthenticationRepo(Db);

export const DepartmentService = new DepartmentServ(departmentRepo),
  assetService = new AssetsServ(assetRepo),
  individualAssetServ = new IndividualAssetServ(individualAssetRepo),
  assetAssignmentsServ = new AssetAssignmentServ(assetAssignmentsRepo),
  userServ = new UserServ(userRepo),
  rolesService = new Roleservice(rolesRepo),
  userRolesServ = new UserRolesServ(userRolesRepo),
  permissionServ = new PermissionService(permissionRepo),
  rolePermissionServ = new RolePermissionServ(rolePermissionRepo),
  logsServ = new LogServ(logsRepo),
  authService = new AuthenticationService(authRepo);
