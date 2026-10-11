import { connection } from "next/server";
import { db } from "@/prisma/db";
import { DEFAULT_SITE_CONTENT, SETTINGS_ID, type SiteContent } from "./site-defaults";

export { DEFAULT_SITE_CONTENT, SETTINGS_ID, type SiteContent } from "./site-defaults";

// Every loader waits for a request so pages always show the latest
// admin edits instead of a build-time snapshot.
export async function getSiteContent(): Promise<SiteContent> {
  await connection();
  const row = await db.orm.public.SiteSettings.first({ id: SETTINGS_ID });
  if (!row) return DEFAULT_SITE_CONTENT;
  return { ...row, audienceTags: [...row.audienceTags] };
}

export async function getHighlights() {
  await connection();
  return db.orm.public.Highlight.orderBy([
    (h) => h.sortOrder.asc(),
    (h) => h.id.asc(),
  ]).all();
}

export async function getActiveProducts() {
  await connection();
  return db.orm.public.Product.where({ isActive: true })
    .orderBy((p) => p.price.desc())
    .all();
}
