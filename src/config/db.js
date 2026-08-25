import sql from 'mssql';

import { env } from './env.js';

export { sql };

let poolPromise = null;

export function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool({
      server: env.db.server,
      database: env.db.database,
      user: env.db.user,
      password: env.db.password,
      options: env.db.options,
      pool: env.db.pool,
    })
      .connect()
      .catch((error) => {
        poolPromise = null;
        throw error;
      });
  }
  return poolPromise;
}

export async function closePool() {
  if (!poolPromise) return;
  try {
    const pool = await poolPromise;
    await pool.close();
  } finally {
    poolPromise = null;
  }
}

class TypedValue {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

export function typed(type, value) {
  return new TypedValue(type, value);
}

export function buildTvp(typeName, columns, rows) {
  const table = new sql.Table(typeName.includes('.') ? typeName : `dbo.${typeName}`);
  for (const column of columns) {
    table.columns.add(column.name, column.type, { nullable: column.nullable ?? false });
  }
  for (const row of rows) {
    table.rows.add(...columns.map((column) => row[column.name] ?? null));
  }
  return table;
}

export async function execProc(procName, inputs = {}) {
  const pool = await getPool();
  const request = pool.request();

  for (const [name, value] of Object.entries(inputs)) {
    if (value === undefined) continue;
    if (value instanceof TypedValue) {
      request.input(name, value.type, value.value);
    } else if (value instanceof sql.Table) {
      request.input(name, value);
    } else {
      request.input(name, value);
    }
  }

  const result = await request.execute(procName);

  if (result.recordsets && result.recordsets.length > 1) {
    return result.recordsets.filter((rs) => rs && rs.length >= 0);
  }

  return result.recordset ?? [];
}
