// Global setup for vitest - runs before any tests
import { config } from 'dotenv';

export async function setup() {
  // Load .env-sqlite for test environment
  config({ path: '.env-sqlite' });

  // Set test-specific environment variables
  process.env.NODE_ENV = 'e2e';

  process.env.DB_TYPE = 'sqlite';
  process.env.DB_PATH = ':memory:';
  process.env.ENTITY_PATH = __dirname + '/../dist/**/*.entity{.ts,.js}';

  console.log('✅ Global test setup completed - environment variables loaded');
}
