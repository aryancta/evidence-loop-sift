import { AppShell } from "@/components/app-shell";
import { AuditTable } from "@/components/audit-table";
import { GuardrailSummary } from "@/components/guardrail-summary";

export default function GuardrailsPage() {
  return (
    <AppShell>
      <section className="border-b border-border/60 bg-card/20 px-5 py-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight">Guardrails & Audit</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            The allowed tool surface, validation rules, and append-only audit trail. Guardrail enforcement runs in code — nothing here is merely prompted.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-6">
        <GuardrailSummary />
        <AuditTable />
      </div>
    </AppShell>
  );
}
