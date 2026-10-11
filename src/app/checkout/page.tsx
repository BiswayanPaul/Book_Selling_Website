import Link from "next/link";
import { notFound } from "next/navigation";
import { formatRupees } from "@/lib/money";
import { getSiteContent } from "@/lib/site";
import { db } from "@/prisma/db";
import { SiteFooter, SiteHeader } from "../site-chrome";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage({
  searchParams,
}: PageProps<"/checkout">) {
  const { product: slug } = await searchParams;
  if (typeof slug !== "string") notFound();

  const [content, product] = await Promise.all([
    getSiteContent(),
    db.orm.public.Product.where({ slug, isActive: true }).first(),
  ]);
  if (!product) notFound();

  const isPaperback = product.type === "PAPERBACK";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SiteHeader content={content} />

      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-[1fr_1.4fr]">
          <aside>
            <Link href="/" className="text-sm font-semibold text-blue-700 hover:underline">
              ← Back
            </Link>

            <div className="mt-6 overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
              <img
                src={content.coverImageUrl}
                alt={`${product.name} cover`}
                className="h-auto w-full"
              />
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              {isPaperback ? "Paperback" : "PDF"}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-blue-950">
              {product.name}
            </h2>
            {product.description && (
              <p className="mt-2 text-slate-600">{product.description}</p>
            )}
            <p className="mt-4 text-3xl font-extrabold text-blue-950">
              {formatRupees(product.price)}
            </p>
          </aside>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            {isPaperback && product.stock <= 0 ? (
              <p className="text-slate-600">
                Sorry, this book is currently out of stock.
              </p>
            ) : (
              <CheckoutForm
                productSlug={product.slug}
                unitPrice={product.price}
                isPaperback={isPaperback}
                maxQuantity={isPaperback ? Math.min(product.stock, 20) : 1}
              />
            )}
          </div>
        </div>
      </section>

      <SiteFooter content={content} />
    </main>
  );
}
