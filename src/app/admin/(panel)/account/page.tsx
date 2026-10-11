import { requireAdmin } from "@/lib/auth";
import { AccountForm } from "./account-form";

export default async function AccountPage() {
  const admin = await requireAdmin();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-extrabold text-blue-950">Account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Change your admin user ID or password. Changing the password signs out
        all other devices.
      </p>
      <AccountForm username={admin.username} />
    </div>
  );
}
