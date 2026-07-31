import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This grabs your Neon connection string from the .env file
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });