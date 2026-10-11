import { requireAdmin } from "@/lib/auth";
import { db } from "@/prisma/db";
import { saveProduct } from "../../actions";
import { inputClass, primaryButton, SavedBanner, TextField } from "../ui";

export default async function ProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  await requireAdmin();

  const [{ saved, error }, products] = await Promise.all([
    searchParams,
    db.orm.public.Product.orderBy((p) => p.id.asc()).all(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold text-blue-950">Products &amp; prices</h1>
      <p className="mt-1 text-sm text-slate-500">
        Changes appear on the storefront immediately. Hidden products cannot be
        bought.
      </p>

      <div className="mt-6 space-y-6">
        {products.map((product) => (
          <form
            key={product.id}
            action={saveProduct}
            className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-slate-200"
          >
            <input type="hidden" name="id" value={product.id} />

            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                {product.type === "PDF" ? "PDF edition" : "Paperback"}
              </h2>
              <span className="text-xs text-slate-400">{product.slug}</span>
            </div>

            {saved === String(product.id) && <SavedBanner>Saved.</SavedBanner>}
            {error === String(product.id) && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Please check the name, price and stock values.
              </p>
            )}

            <TextField label="Name" name="name" defaultValue={product.name} />
            <TextField
              label="Short description"
              name="description"
              defaultValue={product.description}
              required={false}
              multiline
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Price (₹)</span>
                <input
                  name="price"
                  required
                  inputMode="decimal"
                  defaultValue={(product.price / 100).toString()}
                  className={inputClass}
                />
              </label>
              {product.type === "PAPERBACK" ? (
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Copies in stock</span>
                  <input
                    name="stock"
                    type="number"
                    min={0}
                    required
                    defaultValue={product.stock}
                    className={inputClass}
                  />
                </label>
              ) : (
                <input type="hidden" name="stock" value={product.stock} />
              )}
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" name="isActive" defaultChecked={product.isActive} />
              Available for purchase
            </label>

            <button type="submit" className={primaryButton}>
              Save
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
