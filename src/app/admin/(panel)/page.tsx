import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatRupees } from "@/lib/money";
import { db } from "@/prisma/db";
import { PaymentBadge, StatusBadge } from "./status-badge";
import { formatDate } from "./ui";

export default async function OrdersPage() {
  await requireAdmin();

  const orders = await db.orm.public.Order.include("items", (items) =>
    items.include("product"),
  )
    .include("payment")
    .orderBy((o) => o.id.desc())
    .limit(200)
    .all();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-blue-950">Orders</h1>
      <p className="mt-1 text-sm text-slate-500">
        Customer details submitted through the purchase form. Latest first.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 rounded-xl bg-white p-6 text-slate-600 ring-1 ring-slate-200">
          No orders yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">
                    <Link href={`/admin/orders/${order.id}`} className="text-blue-700 hover:underline">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{order.customerName}</div>
                    <div className="text-slate-500">{order.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.product.type === "PDF" ? "PDF" : "Paperback"} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatRupees(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={order.payment?.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

