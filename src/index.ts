import 'jest';
import process from 'process';
import { Pool } from 'pg';
import generate from 'nanoid/generate';

const nanoid = (): string =>
  generate('0123456789abcdefghijklmnopqrstuvwxyz', 15);

export interface Context {
  pool: Pool;
}

export function connectTestDatabase(each = false): Context {
  const dbUser = process.env.DB_USER || 'postgres';
  const dbName = process.env.DB_NAME || `test_${nanoid()}`;
  const context: Partial<Context> = {};

  async function before(): Promise<void> {
    context.pool = new Pool({ database: 'postgres', user: dbUser });
    await context.pool.query(`CREATE DATABASE ${dbName}`);
    await context.pool.end();
    context.pool = new Pool({ database: dbName, user: dbUser });
  }

  async function after(): Promise<void> {
    if (context.pool) {
      await context.pool.end();
      context.pool = new Pool({ database: 'postgres', user: dbUser });
      await context.pool.query(`DROP DATABASE ${dbName}`);
      await context.pool.end();
      context.pool = undefined;
    }
  }

  if (each) {
    beforeEach(before);
    afterEach(after);
  } else {
    beforeAll(before);
    afterAll(after);
  }

  // this is casted to be nice; whenever a test is running then pool will have
  // a value
  return context as Context;
}
