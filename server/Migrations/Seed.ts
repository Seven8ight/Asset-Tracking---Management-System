import {
  authService,
  DepartmentService,
  rolesService,
  userRolesServ,
} from "../Src/Data Objects/DTO.js";
import type { RegistrationAuth } from "../Src/Modules/Authentication/authentication.types.js";
import { decode_access_token } from "../Src/Utilities/Jwt.js";
import type { PublicUser } from "../Src/Modules/Users/user.types.js";

const userDetails: RegistrationAuth = {
  username: "Admin",
  email: "admin@assetflow.com",
  password: "admin123456",
};

const SaaSadminRole = (await rolesService.getRoles()).find(
    (role) => role.name == "SaaS Admin",
  )!,
  createAdminUser = await authService.register(userDetails),
  decodedAdminUser = decode_access_token(
    createAdminUser.accessToken,
  ) as PublicUser;

await userRolesServ.createUserRole(decodedAdminUser.id, SaaSadminRole.id);
await DepartmentService.createDepartment(decodedAdminUser.id, {
  name: "Admin Department",
  color: "red",
  description: "Admin department",
  manager_id: decodedAdminUser.id,
});
