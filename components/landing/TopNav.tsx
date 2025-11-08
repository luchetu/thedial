import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group inline-flex items-center font-sans text-xl md:text-2xl font-bold">
          <Logo size={48} className="text-primary" />
          <span className="font-bold tracking-tight text-foreground ml-0 leading-none" style={{ transform: 'translateY(-6px)' }}>thedial</span>
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


