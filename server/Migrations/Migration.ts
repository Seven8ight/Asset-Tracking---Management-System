import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Database } from "../Src/Config/Db.js";
import { ErrorMsg, Info } from "../Src/Utilities/Logger.js";
import {
  permissionServ,
  rolePermissionServ,
  rolesService,
} from "../Src/Data Objects/DTO.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database();

const migrationTableCreation = async () => {
  const migrationTable = await fs.readFile(
    path.join(__dirname, "SQL Tables", "000_migrations_table.sql"),
    { encoding: "utf-8" },
  );

  // to_regclass returns NULL if table doesn't exist — never throws
  const result = await db.query(
    "SELECT to_regclass('public.migrations') AS tbl",
  );

  if (result.rows[0].tbl !== null) {
    Info(`Migration table already exists.`);
  } else {
    await db.query(migrationTable);
    Info("Migration table created successfully");
  }
};

const migrationTables = async () => {
  const sqlDirPath = path.join(__dirname, "SQL Tables");
  const sqlDirectory = (await fs.readdir(sqlDirPath)).sort();

  for (let sqlFileName of sqlDirectory) {
    try {
      const sqlFilePath = path.join(sqlDirPath, sqlFileName);
      const sqlFile = await fs.readFile(sqlFilePath, { encoding: "utf-8" });

      // Skip the migrations table file itself by checking file content
      if (sqlFile.includes("migration")) continue;

      // SELECT EXISTS never throws — returns true/false
      const existsResult = await db.query(
        "SELECT EXISTS(SELECT 1 FROM migrations WHERE table_name=$1) AS already_run",
        [sqlFileName],
      );

      if (existsResult.rows[0].already_run) {
        Info(`${sqlFileName} already created, skipping`);
      } else {
        await db.query(sqlFile);
        await db.query("INSERT INTO migrations(table_name) VALUES($1)", [
          sqlFileName,
        ]);
        Info(
          `${sqlFileName} has been created successfully, proceeding to the next.`,
        );
      }

      if (sqlFileName.includes("alter")) {
        Info(`Altering data, Finalizations.`);
      }
    } catch (error) {
      ErrorMsg(error as Error);
      throw new Error(`Error at ${sqlFileName}`);
    }
  }
};

const createPermissions = async () => {
  const permissionService = permissionServ;
  const values: { name: string; group_name: string; description: string }[] = [
    //Department
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

    // Users
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

    // Assets
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

    //Individual assets
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

    //Assignment
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

    //Audit
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

    // Permissions
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

  for (let i = 0; i < values.length; i++) {
    await permissionService.createPermission({
      name: values[i]!.name,
      description: values[i]!.description,
      group_name: values[i]!.group_name,
    });
  }
};

const createRoles = async () => {
  const roles: Record<string, any>[] = [
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

  const roleServ = rolesService;

  for (let role of roles) {
    await roleServ.createRole({
      name: role.name,
      description: role.description,
    });
  }
};

const assignRolePermissions = async () => {
  const roles = await rolesService.getRoles();
  const permissions = await permissionServ.getAllPermission();

  const adminRole = roles.find((r) => r.name === "SaaS Admin")!;
  const departmentManagerRole = roles.find(
    (r) => r.name === "Department Manager",
  )!;
  const assetManagerRole = roles.find((r) => r.name === "Asset Manager")!;
  const maintenanceEngineerRole = roles.find(
    (r) => r.name === "Maintenance Engineer",
  )!;
  const supportStaffRole = roles.find((r) => r.name === "Support Staff")!;

  for (const permission of permissions) {
    const pName = permission.name;
    const pGroup = permission.group_name;

    // --- SaaS Admin ---
    await rolePermissionServ.createRPermission(adminRole.id, permission.id);

    // --- Department Manager ---
    if (
      pName !== "View all logs" &&
      pName !== "Create a permission" &&
      pName !== "Edit a permission" &&
      pName !== "Delete a permission"
    ) {
      await rolePermissionServ.createRPermission(
        departmentManagerRole.id,
        permission.id,
      );
    }

    // --- Asset Manager ---
    if (pGroup === "assets" || pGroup === "individual asset") {
      await rolePermissionServ.createRPermission(
        assetManagerRole.id,
        permission.id,
      );
    }

    // --- Maintenance Engineer ---
    if (pName === "Declare asset broken") {
      await rolePermissionServ.createRPermission(
        maintenanceEngineerRole.id,
        permission.id,
      );
    }

    // --- Support Staff ---
    if (pName === "Assign asset to self") {
      await rolePermissionServ.createRPermission(
        supportStaffRole.id,
        permission.id,
      );
    }
  }
};

// Execution
(async () => {
  try {
    await migrationTableCreation();
    await migrationTables();
    await createRoles();
    await createPermissions();
    await assignRolePermissions();

    Info("All migrations completed successfully");
    Info("Permissions inserted successfully");
    Info("Roles created successfully");
    process.exit(0);
  } catch (error) {
    ErrorMsg(error as Error);
    process.exit(1);
  }
})();
