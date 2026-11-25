#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const { Pool } = require('pg');

function readDatabaseUrl(envPath) {
  if (!fs.existsSync(envPath)) {
    throw new Error(`Arquivo não encontrado: ${envPath}`);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const line = lines.find((entry) => /^\s*DATABASE_URL\s*=/.test(entry));
  if (!line) throw new Error('DATABASE_URL não foi encontrado em .env.local.');
  return line.slice(line.indexOf('=') + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
}

async function main() {
  const projectDir = process.cwd();
  const envPath = path.join(projectDir, '.env.local');
  const connectionString = readDatabaseUrl(envPath);
  const parsed = new URL(connectionString);

  if (parsed.hostname !== '127.0.0.1' || parsed.pathname.replace(/^\//, '') !== 'bsp_dev') {
    throw new Error('Por segurança, este script só aceita 127.0.0.1 e o banco bsp_dev.');
  }

  const rl = readline.createInterface({ input: stdin, output: stdout });
  const identifier = (await rl.question('Digite o e-mail ou ID da carteirinha da conta redefinida localmente: ')).trim();
  rl.close();
  if (!identifier) throw new Error('Identificador não informado.');

  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000, max: 1 });
  try {
    const result = await pool.query(
      `SELECT member_id, password_hash
         FROM public.users
        WHERE member_id = $1 OR lower(email) = lower($1)
        LIMIT 2`,
      [identifier]
    );

    if (result.rowCount === 0) throw new Error('Nenhuma conta correspondente foi encontrada no banco local.');
    if (result.rowCount !== 1) throw new Error('O identificador corresponde a mais de uma conta. Use o ID da carteirinha.');
    const row = result.rows[0];
    if (typeof row.password_hash !== 'string' || !/^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(row.password_hash)) {
      throw new Error('A conta não possui um hash de senha no formato esperado.');
    }

    console.log('\nConta local encontrada.');
    console.log(`ID da carteirinha: ${row.member_id}`);
    console.log('\nHASH DA SENHA — TRATE COMO DADO CONFIDENCIAL:');
    console.log(row.password_hash);
    console.log('\nCopie o hash diretamente para o SQL Editor do Neon na branch main.');
    console.log('Não o envie nesta conversa, não o publique e não o adicione ao Git.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`\nERRO: ${error.message}`);
  process.exitCode = 1;
});
