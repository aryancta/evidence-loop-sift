import {
  Brain,
  ClipboardList,
  GitBranch,
  Layers,
  ListChecks,
  Radar,
  Route,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ValuePropGrid() {
  const cards = [
    {
      icon: Brain,
      title: "Autonomy",
      description:
        "An explicit state machine drives intake → plan → execute → verify → contradict → report, without the analyst babysitting every step.",
    },
    {
      icon: ClipboardList,
      title: "Auditability",
      description:
        "Every claim links to a structured evidence object, a tool run ID, and a raw reference. No free-floating assertions, ever.",
    },
    {
      icon: ShieldCheck,
      title: "Safety",
      description:
        "Only typed MCP tools run. No shell, no fetch, no mutation. Guardrails are enforced in code, not in prompts.",
    },
  ];
  return (
    <section className="mx-auto grid max-w-6xl gap-4 px-6 py-16 md:grid-cols-3">
      {cards.map(({ icon: Icon, title, description }) => (
        <Card key={title} className="p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-cyan-500/10 border border-cyan-400/20">
            <Icon className="h-5 w-5 text-cyan-300" />
          </div>
          <CardTitle className="mb-2 text-lg">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        </Card>
      ))}
    </section>
  );
}

export function ArchitectureStrip() {
  const boxes = [
    { icon: Layers, label: "Typed MCP surface", hint: "4 approved tools" },
    { icon: Route, label: "Agent loop", hint: "6 explicit states" },
    { icon: Radar, label: "Evidence ledger", hint: "provenance graph" },
    { icon: ClipboardList, label: "Signed report", hint: "citations + checksum" },
  ];
  return (
    <section className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">How it fits together</h2>
            <p className="text-sm text-muted-foreground">
              Four composable surfaces — each enforces a constraint the next depends on.
            </p>
          </div>
          <Badge variant="slate">
            <Sparkles className="mr-1.5 h-3 w-3" /> Runs in a single container
          </Badge>
        </div>
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          {boxes.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={b.label} className="flex items-center gap-3 md:flex-1">
                <Card className="flex-1 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-500/10 border border-cyan-400/20">
                      <Icon className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{b.label}</div>
                      <div className="text-xs text-muted-foreground">{b.hint}</div>
                    </div>
                  </div>
                </Card>
                {i < boxes.length - 1 && (
                  <div className="hidden md:block text-cyan-300/60">→</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TrustBadges() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold">Built trustworthy-first</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          These properties are non-negotiable. They are the contract with the responder on call.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-300" />
            <span className="text-sm font-semibold">No external API keys</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Demo runs entirely on bundled fixtures and an in-process agent. No data leaves the container.
          </p>
        </Card>
        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-cyan-300" />
            <span className="text-sm font-semibold">SQLite-backed</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Cases, artifacts, and guardrail rules persist in SQLite so your investigation is reproducible.
          </p>
        </Card>
        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-emerald-300" />
            <span className="text-sm font-semibold">Single-container deploy</span>
          </div>
          <p className="text-sm text-muted-foreground">
            <code className="text-xs">docker build</code> then <code className="text-xs">docker run</code>. That is the entire install story.
          </p>
        </Card>
      </div>
    </section>
  );
}
