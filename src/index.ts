import 'jest';
import { Pool, ClientConfig } from 'pg';
import generate from 'nanoid/generate';

const nanoid = (): string =>
  generate('0123456789abcdefghijklmnopqrstuvwxyz', 15);

export interface Options {
  connection?: ClientConfig;
  eachTest?: boolean;
  initialDatabase?: string;
}

export interface Context {
  pool: Pool;
}

export function connectTestDatabase(options?: Options): Context {
  const { connection = {}, eachTest = false, initialDatabase = 'postgres' } =
    options || {};

  if (!connection.database) {
    connection.database = `test_${nanoid()}`;
  }
  if (!connection.user) {
    connection.user = 'postgres';
  }

  const context: Partial<Context> = {};

  async function before(): Promise<void> {
    context.pool = new Pool({ ...connection, database: initialDatabase });
    await context.pool.query(`CREATE DATABASE ${connection.database}`);
    await context.pool.end();
    context.pool = new Pool(connection);
  }

  async function after(): Promise<void> {
    if (context.pool) {
      await context.pool.end();
      context.pool = new Pool({ ...connection, database: initialDatabase });
      await context.pool.query(`DROP DATABASE ${connection.database}`);
      await context.pool.end();
      context.pool = undefined;
    }
  }

  if (eachTest) {
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
