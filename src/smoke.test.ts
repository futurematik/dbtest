import 'jest';
import { connectTestDatabase } from '.';

describe('smoke test', () => {
  const db = connectTestDatabase();

  it('connects to a database', async () => {
    expect(db.pool).toBeTruthy();

    const result = await db.pool.query(`select current_database() as dbname`);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toHaveProperty('dbname');
  });
});
