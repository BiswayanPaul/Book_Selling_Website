"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmPayment, reportPaymentFailed, type CheckoutResponse } from "./actions";

type RazorpayInstance = {
  open(): void;
  on(event: "payment.failed", handler: (r: { error: { description?: string } }) => void): void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay"));
    document.body.appendChild(script);
  });
}

type Props = {
  token: string;
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  storeName: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
};

export function PayButton(props: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "opening" | "verifying">("idle");
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setStatus("opening");
    try {
      await loadCheckout();
    } catch {
      setStatus("idle");
      setError("Could not load the payment window. Check your connection and try again.");
      return;
    }

    const rzp = new window.Razorpay!({
      key: props.keyId,
      order_id: props.razorpayOrderId,
      amount: props.amount,
      currency: "INR",
      name: props.storeName,
      description: props.description,
      prefill: props.prefill,
      theme: { color: "#1e40af" },
      modal: { ondismiss: () => setStatus("idle") },
      handler: async (response: CheckoutResponse) => {
        setStatus("verifying");
        const result = await confirmPayment(props.token, response);
        if (result.ok) {
          router.push(`/checkout/success?token=${props.token}`);
        } else {
          setStatus("idle");
          setError(
            "We couldn't verify your payment. If money was deducted, don't pay again. We will confirm it shortly.",
          );
        }
      },
    });

    rzp.on("payment.failed", (r) => {
      void reportPaymentFailed(props.token);
      setError(r.error.description ?? "Payment failed. Please try again.");
    });

    rzp.open();
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={pay}
        disabled={status !== "idle"}
        className="w-full rounded-xl bg-blue-800 px-5 py-3.5 font-bold text-white transition hover:bg-blue-900 disabled:opacity-60"
      >
        {status === "verifying"
          ? "Confirming payment…"
          : status === "opening"
            ? "Opening payment…"
            : "Pay now"}
      </button>
    </div>
  );
}
