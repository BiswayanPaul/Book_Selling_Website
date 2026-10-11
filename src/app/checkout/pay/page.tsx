import { notFound, redirect } from "next/navigation";
import { formatRupees } from "@/lib/money";
import { getOrderByToken } from "@/lib/orders";
import { ensurePayment } from "@/lib/payments";
import { isRazorpayConfigured, razorpayKeyId } from "@/lib/razorpay";
import { getSiteContent } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../../site-chrome";
import { PayButton } from "./pay-button";

export const metadata = { title: "Payment" };

export default async function PayPage({ searchParams }: PageProps<"/checkout/pay">) {
  const { token } = await searchParams;
  const [order, content] = await Promise.all([getOrderByToken(token), getSiteContent()]);
  if (!order || typeof token !== "string") notFound();

  if (order.payment?.status === "PAID" || order.status === "CANCELLED" || !isRazorpayConfigured()) {
    redirect(`/checkout/success?token=${token}`);
  }

  let payment: Awaited<ReturnType<typeof ensurePayment>> | null = null;
  try {
    payment = await ensurePayment(order);
  } catch (error) {
    console.error("Razorpay order creation failed", error);
  }

  const description = order.items
    .map((i) => `${i.product.name} (${i.product.type === "PDF" ? "PDF" : "Paperback"}) × ${i.quantity}`)
    .join(", ");

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SiteHeader content={content} />

      <section className="mx-auto max-w-lg px-6 py-14">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
          Order #{order.id}
        </p>
        <h2 className="mt-1 text-3xl font-extrabold text-blue-950">Complete your payment</h2>

        <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <p className="text-slate-700">{description}</p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="font-semibold text-slate-600">Total</span>
            <span className="text-2xl font-extrabold text-blue-950">
              {formatRupees(order.totalAmount)}
            </span>
          </div>
        </div>

        <div className="mt-6">
          {payment?.razorpayOrderId ? (
            <PayButton
              token={token}
              keyId={razorpayKeyId()}
              razorpayOrderId={payment.razorpayOrderId}
              amount={order.totalAmount}
              storeName={content.storeName}
              description={description}
              prefill={{
                name: order.customerName,
                email: order.customerEmail,
                contact: order.customerPhone,
              }}
            />
          ) : (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Payment is temporarily unavailable. Your order has been saved, so
              please refresh this page in a minute to try again.
            </p>
          )}
          <p className="mt-3 text-center text-xs text-slate-500">
            Secure payment by Razorpay: UPI, cards, net banking and wallets.
          </p>
        </div>
      </section>

      <SiteFooter content={content} />
    </main>
  );
}
