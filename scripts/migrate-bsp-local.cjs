#!/usr/bin/env node
/**
 * Aplica a migração da Área do Integrante SOMENTE no PostgreSQL local bsp_dev.
 * Execute a partir de qualquer diretório dentro do projeto, ou com o caminho completo.
 */
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

function readEnvValue(envPath, key) {
  if (!fs.existsSync(envPath)) {
    throw new Error(`Arquivo não encontrado: ${envPath}`);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const line = content.split(/\r?\n/).find((entry) =>
    new RegExp(`^\\s*${key}\\s*=`).test(entry)
  );
  if (!line) throw new Error(`${key} não encontrada em .env.local`);

  let value = line.slice(line.indexOf('=') + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const envPath = path.join(projectRoot, '.env.local');
  const migrationPath = path.join(
    projectRoot,
    'src/db/migrations/0001_member_area_operations.sql'
  );

  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Arquivo de migração não encontrado: ${migrationPath}`);
  }

  const connectionString = readEnvValue(envPath, 'DATABASE_URL');
  let parsedUrl;
  try {
    parsedUrl = new URL(connectionString);
  } catch {
    throw new Error('DATABASE_URL não é uma URL PostgreSQL válida.');
  }

  // Trava de segurança: não permite executar no Neon nem em outro banco.
  const allowedHosts = new Set(['127.0.0.1', 'localhost', '::1']);
  const databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ''));
  if (!allowedHosts.has(parsedUrl.hostname) || databaseName !== 'bsp_dev') {
    throw new Error(
      `Execução cancelada por segurança. Esperado PostgreSQL local bsp_dev; ` +
      `a URL aponta para host "${parsedUrl.hostname}" e banco "${databaseName}". ` +
      'Nenhuma alteração foi feita.'
    );
  }

  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    max: 1,
  });

  let client;
  let transactionOpen = false;
  try {
    client = await pool.connect();

    const connectionInfo = await client.query(`
      SELECT current_database() AS database,
             inet_server_addr()::text AS server
    `);
    const actual = connectionInfo.rows[0];
    const loopbackServer = actual.server === '127.0.0.1/32' || actual.server === '::1/128';

    if (actual.database !== 'bsp_dev' || !loopbackServer) {
      throw new Error(
        `Conexão recusada por segurança. Conectou em database=${actual.database}, ` +
        `server=${actual.server}. Esperado bsp_dev em loopback. Nenhuma alteração foi feita.`
      );
    }

    const memberIdUnique = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM pg_index i
        JOIN pg_class t ON t.oid = i.indrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN pg_attribute a
          ON a.attrelid = t.oid
         AND a.attnum = ANY(i.indkey)
        WHERE n.nspname = 'public'
          AND t.relname = 'users'
          AND i.indisunique
          AND i.indnatts = 1
          AND a.attname = 'member_id'
      ) AS valid
    `);

    if (!memberIdUnique.rows[0]?.valid) {
      throw new Error(
        'A tabela public.users não possui índice UNIQUE somente em member_id. ' +
        'Migração cancelada sem alterações.'
      );
    }

    console.log('Banco confirmado: bsp_dev (PostgreSQL local).');
    console.log('Integridade confirmada: users.member_id é UNIQUE.');
    console.log('Aplicando src/db/migrations/0001_member_area_operations.sql ...');

    await client.query('BEGIN');
    transactionOpen = true;
    await client.query(migrationSql);
    await client.query('COMMIT');
    transactionOpen = false;

    const verification = await client.query(`
      SELECT 'table' AS type, table_name AS item
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('event_rsvps', 'announcements')
      UNION ALL
      SELECT 'column' AS type, table_name || '.' || column_name AS item
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'events'
        AND column_name IN ('concentration_at', 'dress_code')
      ORDER BY type, item
    `);

    const found = new Set(verification.rows.map((row) => row.item));
    const required = [
      'announcements',
      'event_rsvps',
      'events.concentration_at',
      'events.dress_code',
    ];
    const missing = required.filter((item) => !found.has(item));

    console.log('\nVerificação final:');
    for (const item of required) {
      console.log(`${found.has(item) ? 'OK' : 'FALTA'}  ${item}`);
    }

    if (missing.length) {
      throw new Error(`Migração executada, mas faltam itens na verificação: ${missing.join(', ')}`);
    }

    console.log('\nMigração local concluída com sucesso. Nenhum banco remoto foi acessado.');
  } catch (error) {
    if (client && transactionOpen) {
      try {
        await client.query('ROLLBACK');
        console.error('Transação revertida.');
      } catch (rollbackError) {
        console.error('Não foi possível confirmar o rollback:', rollbackError.message);
      }
    }
    throw error;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`\nERRO: ${error.message}`);
  process.exitCode = 1;
});
