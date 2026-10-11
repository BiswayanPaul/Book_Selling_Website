"use client";

import { useActionState } from "react";
import { updateAccount, type AccountState } from "../../actions";
import { inputClass, primaryButton, SavedBanner } from "../ui";

export function AccountForm({ username }: { username: string }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(
    updateAccount,
    {},
  );

  return (
    <form action={action} className="mt-6 space-y-4 rounded-xl bg-white p-5 ring-1 ring-slate-200">
      {state.success && <SavedBanner>{state.success}</SavedBanner>}
      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">User ID</span>
        <input
          name="username"
          required
          defaultValue={username}
          autoComplete="username"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">New password</span>
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-slate-500">
          Leave blank to keep your current password.
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Confirm new password</span>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={inputClass}
        />
      </label>

      <label className="block border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-slate-700">Current password</span>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-slate-500">
          Required to save any change.
        </span>
      </label>

      <button type="submit" disabled={pending} className={`${primaryButton} disabled:opacity-60`}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
