import "dotenv/config";
import { db } from "../src/prisma/db.ts";
import { DEFAULT_SITE_CONTENT, SETTINGS_ID } from "../src/lib/site-defaults.ts";

// Seeds the editable storefront content. Safe to re-run: existing rows are kept.
async function main() {
  const existing = await db.orm.public.SiteSettings.first({ id: SETTINGS_ID });
  if (existing) {
    console.log("Site settings already exist, skipping.");
  } else {
    await db.orm.public.SiteSettings.create({
      id: SETTINGS_ID,
      ...DEFAULT_SITE_CONTENT,
    });
    console.log("Created site settings.");
  }

  const highlights = await db.orm.public.Highlight.all();
  if (highlights.length > 0) {
    console.log("Highlights already exist, skipping.");
  } else {
    const defaults = [
      { headline: "200", title: "TOPICS", description: "from 20 Medical Branches" },
      { headline: "1000+", title: "HIGH-YIELD", description: "Mnemonics & Memory Tips" },
      { headline: "PERFECT FOR", title: null, description: "Various University & Competitive Exams" },
      { headline: "EXAM-FOCUSED", title: null, description: "Quick Revision, Easy Recall, Better Retention" },
    ];
    for (const [index, highlight] of defaults.entries()) {
      await db.orm.public.Highlight.create({ ...highlight, sortOrder: index + 1 });
    }
    console.log(`Created ${defaults.length} highlights.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
