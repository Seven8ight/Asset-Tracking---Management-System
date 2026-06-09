import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Database } from "../Src/Config/Db.js";
import { ErrorMsg, Info } from "../Src/Utilities/Logger.js";

const __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename);

const db = new Database();

const migrationTableCreation = async () => {
    const migrationTable = await fs.readFile(
      path.join(__dirname, "SQL Tables", "000_migrations_table.sql"),
      { encoding: "utf-8" },
    );

    try {
      await db.query("SELECT 1 FROM migrations");
      Info(`Migration table already exists.`);
    } catch (error) {
      try {
        if (((error as any).code = "42PO1")) await db.query(migrationTable);

        Info("Migration table created successfully");
      } catch (error) {
        ErrorMsg(error as Error);
      }
    }
  },
  migrationTables = async () => {
    const sqlDirPath = path.join(__dirname, "SQL Tables"),
      sqlDirectory = (await fs.readdir(sqlDirPath)).sort();

    for (let sqlFileName of sqlDirectory) {
      try {
        const sqlFilePath = path.join(sqlDirPath, sqlFileName),
          sqlFile = await fs.readFile(sqlFilePath, { encoding: "utf-8" });

        if (sqlFile.includes("migration")) continue;

        const tableCreated = await db.query(
          "SELECT * FROM migrations WHERE table_name=$1",
          [sqlFileName],
        );

        if (tableCreated && tableCreated.rowCount && tableCreated.rowCount > 0)
          Info(`${sqlFileName} already created, skipping`);
        else {
          await db.query(sqlFile);
          await db.query("INSERT INTO migrations(table_name) VALUES($1)", [
            sqlFileName,
          ]);

          Info(
            `${sqlFileName} has been created successfully, proceeding to the next.`,
          );
        }

        if (!sqlFileName.includes("alter")) {
        } else Info(`Altering data, Finalizations.`);
      } catch (error) {
        ErrorMsg(error as Error);
      }
    }
  },
  createPermissions = async () => {
    const values: { name: string; description: string }[] = [
        {
          name: "System Admin",
          description: "All access, only for Super SaaS admins",
        },
        {
          name: "User and Access Management",
          description: "Handles staff, staff roles, roles,  role permissions",
        },
        {
          name: "Inventory and Supply Management",
          description: "Handles business products and supply",
        },
        {
          name: "Sales and Finance Management",
          description: "Handles all expenses and sales made",
        },
        {
          name: "Transaction Management",
          description:
            "Handles POS registration and transactions present along with refunds",
        },
      ],
      insertionString: string = `
      INSERT INTO permissions(name,description) VALUES($1,$2)
    `;

    for (let i = 0; i < values.length; i++) {
      const sqlQuery = await db.query(insertionString, [
        values[i]!.name,
        values[i]!.description,
      ]);

      if (!sqlQuery) throw new Error("SQL Query error");
    }
  };

(async () => {
  try {
    await migrationTableCreation();
    await migrationTables();
    // await createPermissions();

    Info("All migrations completed successfully");
    // Info("Permissions inserted successfully");
    process.exit(0);
  } catch (error) {
    ErrorMsg(error as Error);
    process.exit(1);
  }
})();
