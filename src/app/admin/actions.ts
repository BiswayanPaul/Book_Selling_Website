"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSession,
  deleteAllSessions,
  deleteSession,
  requireAdmin,
  verifyCredentials,
} from "@/lib/auth";
import { parseRupees } from "@/lib/money";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/password";
import { SETTINGS_ID, type SiteContent } from "@/lib/site";
import { db } from "@/prisma/db";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function id(formData: FormData): number {
  const value = Number(text(formData, "id"));
  if (!Number.isInteger(value) || value <= 0) throw new Error("Invalid id");
  return value;
}

// ---------- Auth ----------

export async function login(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const username = text(formData, "username");
  // Passwords are not trimmed: surrounding spaces may be intentional.
  const password = formData.get("password");

  const admin =
    typeof password === "string" && username
      ? await verifyCredentials(username, password)
      : null;
  if (!admin) {
    return { error: "Incorrect user ID or password." };
  }

  await createSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

export type AccountState = { error?: string; success?: string };

export async function updateAccount(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const current = await requireAdmin();

  const username = text(formData, "username");
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return { error: "Please fill in the form." };
  }
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    return {
      error: "User ID must be 3–32 characters: letters, numbers, dot, dash or underscore.",
    };
  }

  const admin = await db.orm.public.AdminUser.first({ id: current.id });
  if (!admin || !(await verifyPassword(currentPassword, admin.passwordHash))) {
    return { error: "Current password is incorrect." };
  }

  if (username !== admin.username) {
    const taken = await db.orm.public.AdminUser.where({ username }).first();
    if (taken) return { error: "That user ID is already taken." };
  }

  const changingPassword = newPassword.length > 0;
  if (changingPassword) {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    }
    if (newPassword !== confirmPassword) {
      return { error: "New passwords do not match." };
    }
  }

  await db.orm.public.AdminUser.where({ id: admin.id }).update({
    username,
    ...(changingPassword && { passwordHash: await hashPassword(newPassword) }),
  });

  // A new password signs out every other device; this one gets a fresh session.
  if (changingPassword) {
    await deleteAllSessions(admin.id);
    await createSession(admin.id);
  }

  return { success: changingPassword ? "User ID and password updated." : "User ID updated." };
}

// ---------- Site content ----------

const CONTENT_FIELDS = [
  "storeName",
  "storeTagline",
  "headerNote",
  "bookEdition",
  "bookTitle",
  "bookTitleHighlight",
  "bookDescription",
  "authors",
  "coverImageUrl",
  "highlightsEyebrow",
  "highlightsHeading",
  "audienceEyebrow",
  "audienceHeading",
  "footerTagline",
] as const satisfies readonly (keyof SiteContent)[];

export async function saveSiteContent(formData: FormData) {
  await requireAdmin();

  const content = Object.fromEntries(
    CONTENT_FIELDS.map((field) => [field, text(formData, field)]),
  ) as Omit<SiteContent, "audienceTags">;

  const audienceTags = text(formData, "audienceTags")
    .split(/[\n,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  const data = { ...content, audienceTags };
  const existing = await db.orm.public.SiteSettings.first({ id: SETTINGS_ID });
  if (existing) {
    await db.orm.public.SiteSettings.where({ id: SETTINGS_ID }).update(data);
  } else {
    await db.orm.public.SiteSettings.create({ id: SETTINGS_ID, ...data });
  }

  revalidatePath("/", "layout");
  redirect("/admin/content?saved=1");
}

// ---------- Highlights ----------

function highlightData(formData: FormData) {
  return {
    headline: text(formData, "headline"),
    title: text(formData, "title") || null,
    description: text(formData, "description"),
    sortOrder: Number(text(formData, "sortOrder")) || 0,
  };
}

export async function addHighlight(formData: FormData) {
  await requireAdmin();
  const data = highlightData(formData);
  if (!data.headline || !data.description) return;
  await db.orm.public.Highlight.create(data);
  revalidatePath("/", "layout");
}

export async function updateHighlight(formData: FormData) {
  await requireAdmin();
  const data = highlightData(formData);
  if (!data.headline || !data.description) return;
  await db.orm.public.Highlight.where({ id: id(formData) }).update(data);
  revalidatePath("/", "layout");
}

export async function deleteHighlight(formData: FormData) {
  await requireAdmin();
  await db.orm.public.Highlight.where({ id: id(formData) }).delete();
  revalidatePath("/", "layout");
}

// ---------- Products ----------

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const productId = id(formData);
  const price = parseRupees(text(formData, "price"));
  const stock = Number(text(formData, "stock"));
  const name = text(formData, "name");

  if (!name || price === null || !Number.isInteger(stock) || stock < 0) {
    redirect(`/admin/products?error=${productId}`);
  }

  await db.orm.public.Product.where({ id: productId }).update({
    name,
    description: text(formData, "description") || null,
    price,
    stock,
    isActive: formData.get("isActive") === "on",
  });

  revalidatePath("/", "layout");
  redirect(`/admin/products?saved=${productId}`);
}

// ---------- Orders ----------

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const status = text(formData, "status");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    throw new Error("Invalid status");
  }

  const orderId = id(formData);
  await db.orm.public.Order.where({ id: orderId }).update({
    status: status as (typeof ORDER_STATUSES)[number],
  });

  revalidatePath("/admin", "layout");
}
