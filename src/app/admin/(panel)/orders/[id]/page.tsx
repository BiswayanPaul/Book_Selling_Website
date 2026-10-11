import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatRupees } from "@/lib/money";
import { db } from "@/prisma/db";
import { updateOrderStatus } from "../../../actions";
import { PaymentBadge, StatusBadge } from "../../status-badge";
import { formatDate, inputClass, primaryButton } from "../../ui";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export default async function OrderDetailPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();

  const orderId = Number((await params).id);
  if (!Number.isInteger(orderId)) notFound();

  const order = await db.orm.public.Order.where({ id: orderId })
    .include("items", (items) => items.include("product"))
    .include("payment")
    .first();
  if (!order) notFound();

  const hasShipping = Boolean(order.shippingAddress);

  return (
    <div className="max-w-3xl">
      <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:underline">
        ← All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold text-blue-950">Order #{order.id}</h1>
        <StatusBadge status={order.status} />
        <PaymentBadge status={order.payment?.status} />
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Placed {formatDate(order.createdAt)}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Customer
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Name" value={order.customerName} />
            <Row
              label="Email"
              value={<a href={`mailto:${order.customerEmail}`} className="text-blue-700 hover:underline">{order.customerEmail}</a>}
            />
            <Row
              label="Phone"
              value={<a href={`tel:${order.customerPhone}`} className="text-blue-700 hover:underline">{order.customerPhone}</a>}
            />
          </dl>
        </section>

        <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Delivery
          </h2>
          {hasShipping ? (
            <address className="mt-3 text-sm not-italic leading-6 text-slate-800">
              <span className="whitespace-pre-line">{order.shippingAddress}</span>
              <br />
              {order.shippingCity}, {order.shippingState} – {order.shippingPincode}
            </address>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              Digital order. Send the PDF to the customer&apos;s email.
            </p>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Items</h2>
        <table className="mt-3 w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2">
                  {item.product.name}{" "}
                  <span className="text-slate-500">
                    ({item.product.type === "PDF" ? "PDF" : "Paperback"})
                  </span>
                </td>
                <td className="py-2 text-slate-600">
                  {item.quantity} × {formatRupees(item.unitPrice)}
                </td>
                <td className="py-2 text-right font-semibold">
                  {formatRupees(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200">
            <tr>
              <td colSpan={2} className="pt-3 font-bold">Total</td>
              <td className="pt-3 text-right text-lg font-extrabold">
                {formatRupees(order.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="mt-6 rounded-xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Payment</h2>
        {order.payment ? (
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Status" value={<PaymentBadge status={order.payment.status} />} />
            <Row label="Amount" value={formatRupees(order.payment.amount)} />
            <Row label="Order" value={<code className="text-xs">{order.payment.razorpayOrderId ?? "—"}</code>} />
            <Row label="Payment" value={<code className="text-xs">{order.payment.razorpayPaymentId ?? "—"}</code>} />
          </dl>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            The customer has not started an online payment for this order.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Update status
        </h2>
        <form action={updateOrderStatus} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={order.id} />
          <select name="status" defaultValue={order.status} className={`${inputClass} w-auto`}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button type="submit" className={primaryButton}>
            Save status
          </button>
        </form>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
