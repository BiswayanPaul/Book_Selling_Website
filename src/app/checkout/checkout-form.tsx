"use client";

import { useActionState, useState } from "react";
import { formatRupees } from "@/lib/money";
import { placeOrder, type CheckoutState } from "./actions";

type Props = {
  productSlug: string;
  unitPrice: number;
  isPaperback: boolean;
  maxQuantity: number;
};

export function CheckoutForm({
  productSlug,
  unitPrice,
  isPaperback,
  maxQuantity,
}: Props) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(
    placeOrder,
    {},
  );
  const [quantity, setQuantity] = useState(
    Number(state.values?.quantity) || 1,
  );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="productSlug" value={productSlug} />

      {state.message && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-blue-950">Your details</legend>

        <Field
          label="Full name"
          name="customerName"
          autoComplete="name"
          state={state}
        />
        <Field
          label="Email"
          name="customerEmail"
          type="email"
          autoComplete="email"
          state={state}
          hint={isPaperback ? undefined : "Your PDF will be sent to this email."}
        />
        <Field
          label="Mobile number"
          name="customerPhone"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          state={state}
        />
      </fieldset>

      {isPaperback && (
        <fieldset className="space-y-4">
          <legend className="text-lg font-bold text-blue-950">
            Delivery address
          </legend>

          <Field
            label="Address"
            name="shippingAddress"
            autoComplete="street-address"
            state={state}
            multiline
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="City"
              name="shippingCity"
              autoComplete="address-level2"
              state={state}
            />
            <Field
              label="State"
              name="shippingState"
              autoComplete="address-level1"
              state={state}
            />
            <Field
              label="Pincode"
              name="shippingPincode"
              autoComplete="postal-code"
              inputMode="numeric"
              state={state}
            />
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-semibold text-slate-700"
            >
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-28 rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-700 focus:outline-none"
            />
            {state.errors?.quantity && (
              <p className="mt-1 text-sm text-red-600">{state.errors.quantity}</p>
            )}
          </div>
        </fieldset>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
        <span className="font-semibold text-slate-600">Total</span>
        <span className="text-2xl font-extrabold text-blue-950">
          {formatRupees(unitPrice * (quantity > 0 ? quantity : 1))}
        </span>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-blue-800 px-5 py-3.5 font-bold text-white transition hover:bg-blue-900 disabled:opacity-60"
      >
        {pending ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  state,
  hint,
  multiline,
  ...inputProps
}: {
  label: string;
  name: keyof NonNullable<CheckoutState["errors"]>;
  state: CheckoutState;
  hint?: string;
  multiline?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const error = state.errors?.[name];
  const className = `mt-1 w-full rounded-xl border px-4 py-2.5 focus:outline-none ${
    error
      ? "border-red-400 focus:border-red-600"
      : "border-slate-300 focus:border-blue-700"
  }`;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          rows={3}
          required
          defaultValue={state.values?.[name]}
          autoComplete={inputProps.autoComplete}
          className={className}
        />
      ) : (
        <input
          id={name}
          name={name}
          required
          defaultValue={state.values?.[name]}
          className={className}
          {...inputProps}
        />
      )}
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>
      )}
    </div>
  );
}
