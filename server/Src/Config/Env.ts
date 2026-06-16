import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url)),
  envFile = path.join(__dirname, ".env");

dotenv.config({
  path: envFile,
});

export const DATABASE_URL = process.env.DATABASE_URL,
  SERVER_PORT = process.env.SERVER_PORT,
  JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN,
  RESEND_KEY = process.env.RESEND_KEY,
  REDIRECT_URL = process.env.REDIRECT_URL;
