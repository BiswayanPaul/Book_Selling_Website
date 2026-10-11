import Link from "next/link";
import { notFound } from "next/navigation";
import { formatRupees } from "@/lib/money";
import { getOrderByToken } from "@/lib/orders";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { getSiteContent } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../../site-chrome";

export const metadata = { title: "Order status" };

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const { token } = await searchParams;
  const [order, content] = await Promise.all([getOrderByToken(token), getSiteContent()]);
  if (!order) notFound();

  const paid = order.payment?.status === "PAID";
  const awaitingPayment = !paid && isRazorpayConfigured() && order.status !== "CANCELLED";
  const isPdf = order.items.every((i) => i.product.type === "PDF");

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SiteHeader content={content} />

      <section className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
          Order #{order.id}
        </p>

        {paid ? (
          <>
            <h2 className="mt-2 text-3xl font-extrabold text-blue-950">
              Payment received. Thank you!
            </h2>
            <p className="mt-4 text-slate-600">
              We have received {formatRupees(order.totalAmount)}.{" "}
              {isPdf
                ? `Your PDF will be sent to ${order.customerEmail}.`
                : "We will ship your book to the address you provided and keep you updated."}
            </p>
          </>
        ) : awaitingPayment ? (
          <>
            <h2 className="mt-2 text-3xl font-extrabold text-blue-950">
              Payment not completed
            </h2>
            <p className="mt-4 text-slate-600">
              Your order is saved but we haven&apos;t received payment yet. If money
              was deducted, please wait a few minutes. It will update
              automatically.
            </p>
            <Link
              href={`/checkout/pay?token=${order.accessToken}`}
              className="mt-6 inline-block rounded-xl bg-blue-800 px-6 py-3 font-bold text-white transition hover:bg-blue-900"
            >
              Pay {formatRupees(order.totalAmount)}
            </Link>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-3xl font-extrabold text-blue-950">
              Your order has been received
            </h2>
            <p className="mt-4 text-slate-600">
              We have saved your details and will contact you shortly to confirm
              your order.
            </p>
          </>
        )}

        <div className="mt-8">
          <Link href="/" className="font-semibold text-blue-700 hover:underline">
            Back to home
          </Link>
        </div>
      </section>

      <SiteFooter content={content} />
    </main>
  );
}
