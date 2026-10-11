import { db } from "@/prisma/db";
import { createRazorpayOrder } from "./razorpay";

// Returns the order's Payment row, creating it (and the matching Razorpay
// order) on first use. Safe to call repeatedly, e.g. when a customer
// comes back to pay later.
export async function ensurePayment(order: { id: number; totalAmount: number }) {
  const existing = await db.orm.public.Payment.where({ orderId: order.id }).first();
  if (existing?.razorpayOrderId) return existing;

  const rzpOrder = await createRazorpayOrder({
    amount: order.totalAmount,
    receipt: `order_${order.id}`,
    notes: { orderId: String(order.id) },
  });

  if (existing) {
    return db.orm.public.Payment.where({ id: existing.id }).update({
      razorpayOrderId: rzpOrder.id,
      amount: order.totalAmount,
    });
  }

  try {
    return await db.orm.public.Payment.create({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: order.totalAmount,
    });
  } catch (error) {
    // Two requests raced to create it; use the winner's row.
    const winner = await db.orm.public.Payment.where({ orderId: order.id }).first();
    if (winner) return winner;
    throw error;
  }
}

// Marks a payment as paid, confirms the order and takes the paperback copies
// out of stock. Called from both the browser callback and the webhook, so it
// must be idempotent: the guarded UPDATE lets exactly one caller win.
export async function markPaymentPaid(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}): Promise<"paid" | "already-paid" | "unknown-order"> {
  return db.transaction(async (tx) => {
    const payment = await tx.orm.public.Payment.where({
      razorpayOrderId: input.razorpayOrderId,
    }).first();
    if (!payment) return "unknown-order";

    // Webhooks carry no checkout signature, so only overwrite it when given.
    const signature = input.razorpaySignature ?? payment.razorpaySignature ?? "";
    const { affectedRows } = await tx.execute(
      db.raw.sql`
        UPDATE "public"."Payment"
        SET "status" = 'PAID',
            "razorpayPaymentId" = ${input.razorpayPaymentId},
            "razorpaySignature" = NULLIF(${signature}, ''),
            "updatedAt" = now()
        WHERE "id" = ${payment.id} AND "status" <> 'PAID'
      `.affectedCount().build(),
    );
    if (affectedRows === 0) return "already-paid";

    await tx.execute(
      db.raw.sql`
        UPDATE "public"."Order"
        SET "status" = 'CONFIRMED', "updatedAt" = now()
        WHERE "id" = ${payment.orderId} AND "status" = 'PENDING'
      `.affectedCount().build(),
    );

    const items = await tx.orm.public.OrderItem.where({ orderId: payment.orderId })
      .include("product")
      .all();
    for (const item of items) {
      if (item.product.type !== "PAPERBACK") continue;
      await tx.execute(
        db.raw.sql`
          UPDATE "public"."Product"
          SET "stock" = GREATEST("stock" - ${item.quantity}, 0), "updatedAt" = now()
          WHERE "id" = ${item.productId}
        `.affectedCount().build(),
      );
    }

    return "paid";
  });
}

export async function markPaymentFailed(razorpayOrderId: string) {
  await db.orm.public.Payment.where({ razorpayOrderId })
    .where((p) => p.status.neq("PAID"))
    .update({ status: "FAILED" });
}
