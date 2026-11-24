import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
if (!process.env.DATABASE_URL) dotenv.config();
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não encontrado. Verifique seu .env.local.");
  process.exit(1);
}

const baseSql = await readFile(new URL("../drizzle/0001_music_instrument_settings.sql", import.meta.url), "utf8");
const expansionSql = await readFile(new URL("../drizzle/0002_music_studio_expansion.sql", import.meta.url), "utf8");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(baseSql);
  await pool.query(expansionSql);
  console.log("Estrutura expandida do estúdio musical criada/verificada com sucesso.");
} catch (error) {
  console.error("Não foi possível preparar o banco do estúdio musical:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
