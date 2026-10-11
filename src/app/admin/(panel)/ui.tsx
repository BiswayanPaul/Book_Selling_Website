export const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none";

export const primaryButton =
  "rounded-lg bg-blue-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-900";

export const dangerButton =
  "rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50";

export function TextField({
  label,
  name,
  defaultValue,
  multiline,
  hint,
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  multiline?: boolean;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          rows={3}
          required={required}
          defaultValue={defaultValue ?? ""}
          className={inputClass}
        />
      ) : (
        <input
          name={name}
          required={required}
          defaultValue={defaultValue ?? ""}
          className={inputClass}
        />
      )}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function SavedBanner({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
      {children}
    </p>
  );
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}
