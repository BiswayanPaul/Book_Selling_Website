import "dotenv/config";
import { db } from "../src/prisma/db.ts";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../src/lib/password.ts";

// Creates an admin, or resets the password of an existing one.
// Usage: npm run admin:create -- <username> <password>
async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.error("Usage: npm run admin:create -- <username> <password>");
    process.exitCode = 1;
    return;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hashPassword(password);
  const existing = await db.orm.public.AdminUser.where({ username }).first();

  if (existing) {
    await db.orm.public.AdminUser.where({ id: existing.id }).update({ passwordHash });
    // Sign out everywhere so the old password's sessions stop working.
    await db.orm.public.AdminSession.where({ adminId: existing.id }).deleteAll();
    console.log(`Password reset for admin "${username}".`);
  } else {
    await db.orm.public.AdminUser.create({ username, passwordHash });
    console.log(`Created admin "${username}".`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
