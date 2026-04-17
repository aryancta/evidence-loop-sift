import { AppShell } from "@/components/app-shell";
import { Hero } from "@/components/hero";
import { ArchitectureStrip, TrustBadges, ValuePropGrid } from "@/components/feature-grid";

export default function LandingPage() {
  return (
    <AppShell>
      <Hero />
      <ValuePropGrid />
      <ArchitectureStrip />
      <TrustBadges />
      <footer className="border-t border-border/60 bg-card/20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 md:flex-row md:items-center">
          <div className="text-xs text-muted-foreground">
            EvidenceLoop SIFT · autonomous DFIR triage with evidence-first reasoning. Built for a hackathon by Aryan Choudhary.
          </div>
          <div className="text-xs text-muted-foreground">
            No telemetry · No external calls · SQLite + in-process agent
          </div>
        </div>
      </footer>
    </AppShell>
  );
}
