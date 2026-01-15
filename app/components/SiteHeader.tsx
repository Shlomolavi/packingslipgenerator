import Link from 'next/link';
import Image from 'next/image';

export const SiteHeader = () => {
    return (
        <header className="w-full border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
            {/* Max-width container matching strict requirements */}
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center">
                <Link href="/" className="inline-flex items-center">
                    <Image
                        src="/logo/packing-slip-generator-logo.png"
                        alt="Packing Slip Generator"
                        width={220}
                        height={40}
                        // Robust classnames to thwart global CSS overrides
                        className="site-logo !h-8 !w-auto shrink-0 object-contain"
                        priority
                    />
                </Link>
                <span className="ml-4 text-xs text-gray-500 opacity-60 font-mono select-none">
                    v-LOGO-TEST-001
                </span>
            </div>
        </header>
    );
};
