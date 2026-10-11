import { createHmac, timingSafeEqual } from "node:crypto";

// API keys come from the Razorpay Dashboard → Account & Settings → API Keys.
// The webhook secret is the one you type when adding the webhook.
function config() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

export function isRazorpayConfigured(): boolean {
  return config() !== null;
}

export function razorpayKeyId(): string {
  const cfg = config();
  if (!cfg) throw new Error("Razorpay is not configured.");
  return cfg.keyId;
}

export async function createRazorpayOrder(input: {
  amount: number; // paise
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string }> {
  const cfg = config();
  if (!cfg) throw new Error("Razorpay is not configured.");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({ currency: "INR", ...input }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Razorpay order creation failed (${response.status}): ${await response.text()}`);
  }
  return (await response.json()) as { id: string };
}

function hmacMatches(secret: string, payload: string, signature: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest();
  const given = Buffer.from(signature, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Signature returned to the browser by Checkout after a successful payment.
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): boolean {
  const cfg = config();
  if (!cfg) return false;
  return hmacMatches(cfg.keySecret, `${razorpayOrderId}|${razorpayPaymentId}`, signature);
}

// X-Razorpay-Signature header on webhook requests, computed over the raw body.
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  return hmacMatches(secret, rawBody, signature);
}
