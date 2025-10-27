import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] items-start bg-background font-sans">
      <main className="mx-auto w-full max-w-6xl px-4 pt-8 md:pt-10 pb-10 md:pb-12">
        <section className="flex flex-col items-center text-center">
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Turn every client call into searchable notes — without changing how you call.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
            Automatically record, transcribe, and organize your business calls using AI. Works seamlessly with iPhone, Android, and VoIP. Keep your number. Keep your workflow. Get your time back.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-90"
            >
              Try it free →
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Watch how it works
            </Link>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Trusted by professionals who live on their phones — from real estate to finance.
          </p>
        </section>
      </main>
    </div>
  );
}
