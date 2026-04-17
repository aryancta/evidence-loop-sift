import Link from "next/link";
import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="grid-bg absolute inset-0 opacity-30" aria-hidden />
      <div className="absolute -top-32 right-1/4 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" aria-hidden />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-24 md:py-32">
        <Badge variant="cyan" className="gap-2">
          <ShieldCheck className="h-3 w-3" />
          Evidence-first · Auditable · Self-correcting
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl max-w-3xl">
          Autonomous DFIR triage that <span className="text-gradient-cyan">proves</span> how it reached every conclusion.
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          EvidenceLoop SIFT runs an agent loop over a typed MCP tool surface. It plans, executes, verifies, contradicts itself when evidence disagrees, and ships an analyst-ready report with a citation on every claim.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="xl" variant="cyan" className="gap-2">
            <Link href="/dashboard">
              Open Investigation Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="xl" variant="outline" className="gap-2">
            <Link href="/cases">
              <PlayCircle className="h-4 w-4" />
              View Demo Cases
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
