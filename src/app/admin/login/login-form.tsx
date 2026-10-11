"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
          User ID
        </label>
        <input
          id="username"
          name="username"
          required
          autoComplete="username"
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-700 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-700 focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-blue-800 px-5 py-3 font-bold text-white transition hover:bg-blue-900 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
