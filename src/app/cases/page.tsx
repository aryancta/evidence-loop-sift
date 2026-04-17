import { AppShell } from "@/components/app-shell";
import { CaseCard } from "@/components/case-card";
import { DEMO_CASES } from "@/lib/mock-data";

export default function CasesPage() {
  return (
    <AppShell>
      <section className="border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-2xl font-semibold tracking-tight">Case Library</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Bundled incident fixtures designed to exercise the agent loop end to end. Load a case into the dashboard to watch SIFT plan, execute, contradict itself when appropriate, and produce a signed report.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-4 px-6 py-10 md:grid-cols-2">
        {DEMO_CASES.map((c) => (
          <CaseCard key={c.id} demo={c} />
        ))}
      </div>
    </AppShell>
  );
}
