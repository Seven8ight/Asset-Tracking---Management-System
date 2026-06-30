import { Database } from "../Src/Config/Db.js";
import { ErrorMsg, Info } from "../Src/Utilities/Logger.js";
import { fileURLToPath } from "url";

type SeedRole = {
  name: string;
  description: string;
};

type SeedPermission = {
  name: string;
  group_name: string;
  description: string;
};

type DbRole = {
  id: string;
  name: string;
};

type DbPermission = {
  id: string;
  name: string;
  group_name: string;
};

const db = new Database();

const roles: SeedRole[] = [
  {
    name: "SaaS Admin",
    description: "Capable of all actions in the system",
  },
  {
    name: "Department Manager",
    description: "Capable of all actions within a department",
  },
  {
    name: "Asset Manager",
    description: "Capable of managing assets within a department",
  },
  {
    name: "Maintenance Engineer",
    description: "Capable of declaring an asset repaired",
  },
  {
    name: "Support Staff",
    description:
      "Capable of consuming assets and reporting if assets are broken",
  },
];

const permissions: SeedPermission[] = [
  {
    name: "Department creation",
    group_name: "department",
    description: "Capability to create a new department",
  },
  {
    name: "Department update",
    group_name: "department",
    description: "Capability to edit a department details",
  },
  {
    name: "View department users",
    group_name: "department",
    description: "Capability to view users within a department",
  },
  {
    name: "View all departments",
    group_name: "department",
    description: "Capability to view all departments and their details",
  },
  {
    name: "Department deletion",
    group_name: "department",
    description: "Capability to delete a department",
  },
  {
    name: "Invite users",
    group_name: "users",
    description: "Capability to invite external users to department",
  },
  {
    name: "Manage user roles",
    group_name: "users",
    description:
      "Capability to create and manage roles and permissions assigned to users",
  },
  {
    name: "View department users",
    group_name: "users",
    description: "Capability to view all users within the department",
  },
  {
    name: "View all department users",
    group_name: "users",
    description:
      "Capability to view all users across all department within the tenant",
  },
  {
    name: "Create assets",
    group_name: "assets",
    description: "Capability to create assets in the department",
  },
  {
    name: "Edit assets",
    group_name: "assets",
    description: "Capability to edit assets in the department",
  },
  {
    name: "View department asset",
    group_name: "assets",
    description: "Capability to view department asset in the department",
  },
  {
    name: "Delete a department asset",
    group_name: "assets",
    description: "Capability to delete a departmental asset",
  },
  {
    name: "Declare asset broken",
    group_name: "individual asset",
    description: "Capability to declare an asset broken",
  },
  {
    name: "Declare asset repaired",
    group_name: "individual asset",
    description: "Capability to declare an asset repaired",
  },
  {
    name: "Delete an individual asset",
    group_name: "individual asset",
    description: "Capability to delete an individual asset",
  },
  {
    name: "View an assignment",
    group_name: "asset assignment",
    description: "Capability to view asset assignments",
  },
  {
    name: "View departmental assignments",
    group_name: "asset assignment",
    description: "Capability to view departmental asset assignments",
  },
  {
    name: "Assign asset to self",
    group_name: "asset assignment",
    description: "Capability to assign self an asset for use",
  },
  {
    name: "View all logs",
    group_name: "audit",
    description: "Capability to view all audit logs",
  },
  {
    name: "View departmental logs",
    group_name: "audit",
    description: "Capability to view department audit logs",
  },
  {
    name: "View log",
    group_name: "audit",
    description: "Capability to view an audit log",
  },
  {
    name: "View permissions",
    group_name: "permissions",
    description: "Capability to view all permissions in the system",
  },
  {
    name: "Create a permission",
    group_name: "permissions",
    description: "Capability to create a permission",
  },
  {
    name: "Edit a permission",
    group_name: "permissions",
    description: "Capability to edit a permission",
  },
  {
    name: "Delete a permission",
    group_name: "permissions",
    description: "Capability to delete a permission",
  },
];

const shouldAssignDepartmentManager = (permissionName: string): boolean =>
  permissionName !== "View all logs" &&
  permissionName !== "Create a permission" &&
  permissionName !== "Edit a permission" &&
  permissionName !== "Delete a permission";

const createRoles = async (): Promise<void> => {
  for (const role of roles) {
    await db.query(
      `INSERT INTO role(name, description)
       SELECT $1, $2
       WHERE NOT EXISTS(
         SELECT 1 FROM role WHERE name = $1 AND department_id IS NULL
       )`,
      [role.name, role.description],
    );
  }

  Info("Roles seeded successfully");
};

const createPermissions = async (): Promise<void> => {
  for (const permission of permissions) {
    await db.query(
      `INSERT INTO permissions(name, group_name, description)
       SELECT $1, $2, $3
       WHERE NOT EXISTS(
         SELECT 1 FROM permissions WHERE name = $1 AND group_name = $2
       )`,
      [permission.name, permission.group_name, permission.description],
    );
  }

  Info("Permissions seeded successfully");
};

const assignRolePermissions = async (): Promise<void> => {
  const rolesQuery = await db.query<DbRole>(
    `SELECT id, name
     FROM role
     WHERE department_id IS NULL
       AND name = ANY($1::text[])`,
    [roles.map((role) => role.name)],
  );

  const permissionsQuery = await db.query<DbPermission>(
    "SELECT id, name, group_name FROM permissions",
  );

  const rolesMap = new Map(rolesQuery.rows.map((role) => [role.name, role.id]));

  const adminRoleId = rolesMap.get("SaaS Admin");
  const departmentManagerRoleId = rolesMap.get("Department Manager");
  const assetManagerRoleId = rolesMap.get("Asset Manager");
  const maintenanceEngineerRoleId = rolesMap.get("Maintenance Engineer");
  const supportStaffRoleId = rolesMap.get("Support Staff");

  if (
    !adminRoleId ||
    !departmentManagerRoleId ||
    !assetManagerRoleId ||
    !maintenanceEngineerRoleId ||
    !supportStaffRoleId
  ) {
    throw new Error("Expected default roles are missing from the database");
  }

  for (const permission of permissionsQuery.rows) {
    const roleIds = [adminRoleId];

    if (shouldAssignDepartmentManager(permission.name)) {
      roleIds.push(departmentManagerRoleId);
    }

    if (
      permission.group_name === "assets" ||
      permission.group_name === "individual asset"
    ) {
      roleIds.push(assetManagerRoleId);
    }

    if (permission.name === "Declare asset broken") {
      roleIds.push(maintenanceEngineerRoleId);
    }

    if (permission.name === "Assign asset to self") {
      roleIds.push(supportStaffRoleId);
    }

    for (const roleId of roleIds) {
      await db.query(
        `INSERT INTO role_permissions(role_id, permission_id)
         SELECT $1, $2
         WHERE NOT EXISTS(
           SELECT 1
           FROM role_permissions
           WHERE role_id = $1 AND permission_id = $2
         )`,
        [roleId, permission.id],
      );
    }
  }

  Info("Role permissions seeded successfully");
};

export const seedDefaultData = async (): Promise<void> => {
  await createRoles();
  await createPermissions();
  await assignRolePermissions();
};

const runAsScript = async (): Promise<void> => {
  try {
    await seedDefaultData();
    Info("Default data seeded successfully");
    process.exit(0);
  } catch (error) {
    ErrorMsg(error as Error);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  runAsScript();
}
