import Link from "next/link";
import { formatRupees } from "@/lib/money";
import { getActiveProducts, getHighlights, getSiteContent } from "@/lib/site";
import { SiteFooter, SiteHeader } from "./site-chrome";

const productStyles = {
  PAPERBACK: {
    label: "PAPERBACK",
    card: "border-slate-200 bg-white",
    labelText: "text-slate-500",
    button: "bg-blue-800 hover:bg-blue-900",
    cta: "Buy Paperback",
  },
  PDF: {
    label: "PDF",
    card: "border-green-200 bg-green-50",
    labelText: "text-green-700",
    button: "bg-green-700 hover:bg-green-800",
    cta: "Buy PDF",
  },
} as const;

export default async function Home() {
  const [content, highlights, products] = await Promise.all([
    getSiteContent(),
    getHighlights(),
    getActiveProducts(),
  ]);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SiteHeader content={content} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:py-20">
          {/* Cover */}
          <div className="flex justify-center">
            <div className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-200">
              <img
                src={content.coverImageUrl}
                alt={`${content.bookTitle} ${content.bookTitleHighlight} book cover`}
                className="h-auto w-full"
              />
            </div>
          </div>

          {/* Book information */}
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              {content.bookEdition}
            </p>

            <h2 className="text-4xl font-extrabold leading-tight text-blue-950 sm:text-5xl">
              {content.bookTitle}
              <br />
              <span className="text-blue-700">{content.bookTitleHighlight}</span>
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              {content.bookDescription}
            </p>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Authors
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                {content.authors}
              </p>
            </div>

            {/* Purchase options */}
            {products.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {products.map((product) => {
                  const style = productStyles[product.type];
                  const outOfStock =
                    product.type === "PAPERBACK" && product.stock <= 0;

                  return (
                    <div
                      key={product.id}
                      className={`rounded-2xl border p-5 shadow-sm ${style.card}`}
                    >
                      <p className={`text-sm font-semibold ${style.labelText}`}>
                        {style.label}
                      </p>

                      <p className="mt-2 text-3xl font-extrabold text-blue-950">
                        {formatRupees(product.price)}
                      </p>

                      {product.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {product.description}
                        </p>
                      )}

                      {outOfStock ? (
                        <p className="mt-5 w-full rounded-xl bg-slate-200 px-5 py-3 text-center font-bold text-slate-500">
                          Out of stock
                        </p>
                      ) : (
                        <Link
                          href={`/checkout?product=${encodeURIComponent(product.slug)}`}
                          className={`mt-5 block w-full rounded-xl px-5 py-3 text-center font-bold text-white transition ${style.button}`}
                        >
                          {style.cta}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
                This book is not available for purchase right now.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                {content.highlightsEyebrow}
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-blue-950">
                {content.highlightsHeading}
              </h2>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                >
                  <p className="text-2xl font-extrabold text-green-700">
                    {item.headline}
                  </p>

                  {item.title && (
                    <p className="mt-1 font-bold text-blue-950">{item.title}</p>
                  )}

                  <p className="mt-2 leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Audience */}
      {content.audienceTags.length > 0 && (
        <section className="bg-blue-950 text-white">
          <div className="mx-auto max-w-7xl px-6 py-14 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-400">
              {content.audienceEyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-extrabold">
              {content.audienceHeading}
            </h2>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {content.audienceTags.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-blue-800 bg-blue-900 px-5 py-2 text-sm font-semibold"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter content={content} />
    </main>
  );
}
