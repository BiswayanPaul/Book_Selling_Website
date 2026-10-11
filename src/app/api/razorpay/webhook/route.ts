import { markPaymentFailed, markPaymentPaid } from "@/lib/payments";
import { verifyWebhookSignature } from "@/lib/razorpay";

type PaymentEntity = { id: string; order_id: string | null };

type WebhookEvent = {
  event: string;
  payload: { payment?: { entity: PaymentEntity } };
};

// Razorpay calls this when a payment's state changes. It confirms payments
// even if the customer closed the browser before returning to our site.
// Dashboard → Webhooks: URL https://<your-domain>/api/razorpay/webhook,
// events payment.captured, order.paid and payment.failed.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as WebhookEvent;
  const payment = event.payload.payment?.entity;

  if (payment?.order_id) {
    if (event.event === "payment.captured" || event.event === "order.paid") {
      await markPaymentPaid({
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
      });
    } else if (event.event === "payment.failed") {
      await markPaymentFailed(payment.order_id);
    }
  }

  // Always 200 for valid events so Razorpay doesn't retry ones we ignore.
  return Response.json({ ok: true });
}
