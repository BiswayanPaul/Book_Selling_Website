"use server";

import { getOrderByToken } from "@/lib/orders";
import { markPaymentFailed, markPaymentPaid } from "@/lib/payments";
import { verifyPaymentSignature } from "@/lib/razorpay";

export type CheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

// Called by the browser after Razorpay Checkout reports success. The
// signature proves the response really came from Razorpay.
export async function confirmPayment(
  token: string,
  response: CheckoutResponse,
): Promise<{ ok: boolean }> {
  const order = await getOrderByToken(token);
  const razorpayOrderId = order?.payment?.razorpayOrderId;

  if (
    !razorpayOrderId ||
    razorpayOrderId !== response.razorpay_order_id ||
    !verifyPaymentSignature(
      response.razorpay_order_id,
      response.razorpay_payment_id,
      response.razorpay_signature,
    )
  ) {
    return { ok: false };
  }

  await markPaymentPaid({
    razorpayOrderId,
    razorpayPaymentId: response.razorpay_payment_id,
    razorpaySignature: response.razorpay_signature,
  });
  return { ok: true };
}

export async function reportPaymentFailed(token: string) {
  const order = await getOrderByToken(token);
  if (order?.payment?.razorpayOrderId) {
    await markPaymentFailed(order.payment.razorpayOrderId);
  }
}
