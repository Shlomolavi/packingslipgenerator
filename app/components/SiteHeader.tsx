import Link from "next/link";
import Image from "next/image";

export const SiteHeader = () => {
  return (
    <header className="w-full border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            src="/logo/logo-icon-64.png"
            alt="Packing Slip Generator"
            width={48}
            height={48}
            className="shrink-0"
            priority
          />
          <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            Packing Slip Generator
          </span>
        </Link>

        <span className="ml-4 text-xs text-gray-500 opacity-60 font-mono select-none">
          v-LOGO-TEST-001
        </span>
      </div>
    </header>
  );
};
