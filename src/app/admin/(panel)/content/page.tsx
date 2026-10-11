import { requireAdmin } from "@/lib/auth";
import { getHighlights, getSiteContent } from "@/lib/site";
import {
  addHighlight,
  deleteHighlight,
  saveSiteContent,
  updateHighlight,
} from "../../actions";
import { dangerButton, primaryButton, SavedBanner, TextField } from "../ui";

export default async function ContentPage({
  searchParams,
}: PageProps<"/admin/content">) {
  await requireAdmin();

  const [{ saved }, content, highlights] = await Promise.all([
    searchParams,
    getSiteContent(),
    getHighlights(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold text-blue-950">Site content</h1>
      <p className="mt-1 text-sm text-slate-500">
        Everything customers see on the storefront.
      </p>

      <form action={saveSiteContent} className="mt-6 space-y-6">
        {saved && <SavedBanner>Site content saved.</SavedBanner>}

        <Section title="Store">
          <TextField label="Store name" name="storeName" defaultValue={content.storeName} />
          <TextField label="Tagline (under the store name)" name="storeTagline" defaultValue={content.storeTagline} />
          <TextField label="Header note (top right)" name="headerNote" defaultValue={content.headerNote} />
          <TextField label="Footer tagline" name="footerTagline" defaultValue={content.footerTagline} />
        </Section>

        <Section title="Book">
          <TextField label="Edition" name="bookEdition" defaultValue={content.bookEdition} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Title (first line)" name="bookTitle" defaultValue={content.bookTitle} />
            <TextField label="Title (highlighted second line)" name="bookTitleHighlight" defaultValue={content.bookTitleHighlight} />
          </div>
          <TextField label="Description" name="bookDescription" defaultValue={content.bookDescription} multiline />
          <TextField label="Authors" name="authors" defaultValue={content.authors} />
          <TextField
            label="Cover image URL"
            name="coverImageUrl"
            defaultValue={content.coverImageUrl}
            hint="A path inside /public (e.g. /images/book-cover.png) or a full https:// link."
          />
        </Section>

        <Section title="“What's inside” section">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Small heading" name="highlightsEyebrow" defaultValue={content.highlightsEyebrow} />
            <TextField label="Heading" name="highlightsHeading" defaultValue={content.highlightsHeading} />
          </div>
          <p className="text-xs text-slate-500">The cards themselves are edited below.</p>
        </Section>

        <Section title="“Suitable for” section">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Small heading" name="audienceEyebrow" defaultValue={content.audienceEyebrow} />
            <TextField label="Heading" name="audienceHeading" defaultValue={content.audienceHeading} />
          </div>
          <TextField
            label="Tags"
            name="audienceTags"
            defaultValue={content.audienceTags.join(", ")}
            hint="Separate with commas, e.g. MBBS, B.Sc. Nursing, G.N.M."
            required={false}
          />
        </Section>

        <button type="submit" className={primaryButton}>
          Save site content
        </button>
      </form>

      <div className="mt-12">
        <h2 className="text-xl font-extrabold text-blue-950">“What&apos;s inside” cards</h2>
        <p className="mt-1 text-sm text-slate-500">
          Shown in order of the “Order” number, lowest first.
        </p>

        <div className="mt-4 space-y-4">
          {highlights.map((h) => (
            <form
              key={h.id}
              action={updateHighlight}
              className="space-y-3 rounded-xl bg-white p-5 ring-1 ring-slate-200"
            >
              <input type="hidden" name="id" value={h.id} />
              <HighlightFields headline={h.headline} title={h.title} description={h.description} sortOrder={h.sortOrder} />
              <div className="flex gap-3">
                <button type="submit" className={primaryButton}>Save card</button>
                <button type="submit" formAction={deleteHighlight} className={dangerButton}>
                  Delete
                </button>
              </div>
            </form>
          ))}

          <form
            action={addHighlight}
            className="space-y-3 rounded-xl border-2 border-dashed border-slate-300 p-5"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Add a card</h3>
            <HighlightFields sortOrder={(highlights.at(-1)?.sortOrder ?? 0) + 1} />
            <button type="submit" className={primaryButton}>Add card</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-slate-200">
      <legend className="px-1 text-sm font-bold uppercase tracking-wider text-slate-500">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function HighlightFields(props: {
  headline?: string;
  title?: string | null;
  description?: string;
  sortOrder: number;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_6rem]">
        <TextField label="Big text" name="headline" defaultValue={props.headline} hint="e.g. 1000+" />
        <TextField label="Label (optional)" name="title" defaultValue={props.title} required={false} />
        <TextField label="Order" name="sortOrder" defaultValue={props.sortOrder} />
      </div>
      <TextField label="Description" name="description" defaultValue={props.description} />
    </>
  );
}
