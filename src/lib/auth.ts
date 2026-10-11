import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { hashPassword, verifyPassword } from "./password";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// Compared against when the username doesn't exist, so a wrong username
// takes as long as a wrong password and doesn't reveal which one was wrong.
const DUMMY_HASH = hashPassword("dummy-password-for-timing");

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

export async function verifyCredentials(username: string, password: string) {
  const admin = await db.orm.public.AdminUser.where({ username }).first();
  const ok = await verifyPassword(password, admin?.passwordHash ?? (await DUMMY_HASH));
  return admin && ok ? admin : null;
}

export async function createSession(adminId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  // Housekeeping: drop this admin's expired sessions.
  await db.orm.public.AdminSession.where({ adminId })
    .where((s) => s.expiresAt.lt(new Date().toISOString()))
    .deleteAll();

  await db.orm.public.AdminSession.create({
    tokenHash: hashToken(token),
    adminId,
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await db.orm.public.AdminSession.where({ tokenHash: hashToken(token) }).delete();
  }
  cookieStore.delete({ name: COOKIE_NAME, path: "/admin" });
}

// Ends every session of this admin, e.g. after a password change.
export async function deleteAllSessions(adminId: number) {
  await db.orm.public.AdminSession.where({ adminId }).deleteAll();
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await db.orm.public.AdminSession.where({ tokenHash: hashToken(token) })
    .include("admin")
    .first();
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }
  return { id: session.admin.id, username: session.admin.username };
}

// Call at the top of every admin page and every admin Server Action.
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
