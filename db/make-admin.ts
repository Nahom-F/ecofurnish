import "dotenv/config";
import { Pool } from "pg";

// Better Auth manages the `user` table itself (outside Drizzle's schema),
// so this talks to it directly with a raw query instead of going through db/schema.ts.
async function makeAdmin(email: string) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const result = await pool.query(
    `UPDATE "user" SET role = 'admin' WHERE email = $1 RETURNING id, name, email`,
    [email]
  );

  if (result.rowCount === 0) {
    console.error(`No user found with email "${email}". Sign up first, then run this again.`);
  } else {
    console.log(`✓ ${result.rows[0].name} (${result.rows[0].email}) is now an admin.`);
  }

  await pool.end();
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: pnpm make-admin <email>");
  process.exit(1);
}

makeAdmin(email)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
