import Link from "next/link";

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group inline-flex items-center gap-2 font-sans text-xl md:text-2xl font-bold">
          <div className="relative inline-flex h-8 w-8 items-center justify-center">
            {/* Signal waves */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/30"></div>
            <div className="absolute inset-0 rounded-full border border-primary/20 scale-125"></div>
            <div className="absolute inset-0 rounded-full border border-primary/10 scale-150"></div>
            {/* Center circle with d */}
            <span className="relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold leading-none">
              d
            </span>
          </div>
          <span className="font-bold tracking-tight text-foreground">Thedial</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/contact" className="transition-colors hover:text-foreground">
            Contact
          </Link>
          <Link href="/login" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-90"
        >
          Try it Free
        </Link>
      </nav>
    </header>
  );
}


