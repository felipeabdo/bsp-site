#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { randomBytes, scryptSync } = require('node:crypto');
const { Pool } = require('pg');

function readEnvValue(fileContents, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const line = fileContents.split(/\r?\n/).find((entry) =>
    new RegExp(`^\\s*${escaped}\\s*=`).test(entry)
  );
  if (!line) return null;

  let value = line.slice(line.indexOf('=') + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askHidden(question) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
      reject(new Error('Execute este script diretamente em um terminal interativo.'));
      return;
    }

    let value = '';
    const wasRaw = Boolean(stdin.isRaw);

    const cleanup = () => {
      stdin.off('data', onData);
      stdin.setRawMode(wasRaw);
      stdin.pause();
    };

    const onData = (chunk) => {
      const input = chunk.toString('utf8');
      for (const char of input) {
        if (char === '\u0003') {
          cleanup();
          stdout.write('\n');
          reject(new Error('Operação cancelada.'));
          return;
        }
        if (char === '\r' || char === '\n') {
          cleanup();
          stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u0008' || char === '\u007f') {
          const chars = Array.from(value);
          if (chars.length > 0) {
            chars.pop();
            value = chars.join('');
            stdout.write('\b \b');
          }
          continue;
        }
        if (char >= ' ' && char !== '\u007f') {
          value += char;
          stdout.write('*');
        }
      }
    };

    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
  });
}

function createStoredPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const projectDir = process.cwd();
  const envPath = path.join(projectDir, '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error(`Não encontrei ${envPath}. Execute o script na pasta raiz do projeto.`);
  }

  const envContents = fs.readFileSync(envPath, 'utf8');
  const databaseUrl = readEnvValue(envContents, 'DATABASE_URL');
  if (!databaseUrl) throw new Error('DATABASE_URL não encontrado em .env.local.');

  let parsedUrl;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL não é uma URL PostgreSQL válida.');
  }

  const dbNameFromUrl = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ''));
  if (parsedUrl.hostname !== '127.0.0.1' || dbNameFromUrl !== 'bsp_dev') {
    throw new Error(
      'Proteção ativada: este script só pode operar no banco local bsp_dev em 127.0.0.1. Nenhuma alteração foi feita.'
    );
  }

  const pool = new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 5000 });
  let client;

  try {
    client = await pool.connect();
    const dbInfo = await client.query(
      'SELECT current_database() AS database, inet_server_addr()::text AS server'
    );
    const actual = dbInfo.rows[0];
    if (actual.database !== 'bsp_dev' || actual.server !== '127.0.0.1/32') {
      throw new Error(
        `Proteção ativada: conexão inesperada (database=${actual.database}, server=${actual.server}). Nenhuma alteração foi feita.`
      );
    }

    console.log('\nBanco confirmado: bsp_dev (PostgreSQL local).');
    console.log('A redefinição afetará somente esta conta neste banco local.');

    const identifier = await ask('\nInforme o e-mail ou o ID da carteirinha: ');
    if (!identifier) throw new Error('Nenhum e-mail ou ID foi informado.');

    const result = await client.query(
      `SELECT id, member_id, email, first_name, last_name
       FROM public.users
       WHERE lower(email) = lower($1) OR member_id = $1
       LIMIT 2`,
      [identifier]
    );

    if (result.rowCount === 0) {
      throw new Error('Não encontrei uma conta com esse e-mail ou ID no banco local bsp_dev.');
    }
    if (result.rowCount > 1) {
      throw new Error('O identificador corresponde a mais de uma conta. Use o e-mail ou ID exato para desambiguar.');
    }

    const user = result.rows[0];
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
    console.log('\nConta encontrada:');
    console.log(`Nome: ${fullName || '(não informado)'}`);
    console.log(`ID: ${user.member_id}`);
    console.log(`E-mail: ${user.email || '(não informado)'}`);

    const confirmation = (await ask('\nConfirma redefinir a senha desta conta local? (s/N): ')).toLowerCase();
    if (confirmation !== 's' && confirmation !== 'sim') {
      console.log('Operação cancelada. Nenhuma alteração foi feita.');
      return;
    }

    const password = await askHidden('Nova senha (mínimo de 8 caracteres; não será exibida): ');
    if (password.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.');
    const repeated = await askHidden('Repita a nova senha: ');
    if (password !== repeated) throw new Error('As senhas não coincidem. Nenhuma alteração foi feita.');

    const stored = createStoredPassword(password);
    await client.query('BEGIN');
    try {
      const updated = await client.query(
        'UPDATE public.users SET password_hash = $1 WHERE id = $2 RETURNING member_id',
        [stored, user.id]
      );
      if (updated.rowCount !== 1) throw new Error('Não foi possível atualizar exatamente uma conta.');
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    console.log(`\nSenha redefinida com sucesso para ${updatedSafeId(user.member_id)}.`);
    console.log('Somente password_hash foi alterado; os demais dados da conta foram preservados.');
    console.log('Agora entre em http://localhost:3000/entrar usando a nova senha.');
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

function updatedSafeId(memberId) {
  return memberId || 'a conta selecionada';
}

main().catch((error) => {
  console.error(`\nERRO: ${error.message}`);
  process.exitCode = 1;
});
