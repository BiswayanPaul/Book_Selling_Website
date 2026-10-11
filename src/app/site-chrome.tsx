import Link from "next/link";
import type { SiteContent } from "@/lib/site";

export function SiteHeader({ content }: { content: SiteContent }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            {content.storeName}
          </p>
          <h1 className="text-lg font-bold text-blue-950">
            {content.storeTagline}
          </h1>
        </Link>

        <div className="text-sm text-slate-600">{content.headerNote}</div>
      </div>
    </header>
  );
}

export function SiteFooter({ content }: { content: SiteContent }) {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 text-center">
        <p className="font-bold text-blue-950">{content.storeName}</p>
        <p className="mt-1 text-sm text-slate-500">{content.footerTagline}</p>
      </div>
    </footer>
  );
}
