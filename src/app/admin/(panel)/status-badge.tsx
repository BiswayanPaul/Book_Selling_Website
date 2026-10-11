const styles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-slate-200 text-slate-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] ?? styles.PENDING}`}
    >
      {status}
    </span>
  );
}

const paymentStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-slate-200 text-slate-600",
};

export function PaymentBadge({ status }: { status?: string | null }) {
  const label = status === "PAID" || status === "FAILED" || status === "REFUNDED" ? status : "UNPAID";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${paymentStyles[label] ?? "bg-amber-100 text-amber-800"}`}
    >
      {label}
    </span>
  );
}
