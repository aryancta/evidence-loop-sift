import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEMO_CASES } from "@/lib/mock-data";

export default function ReportIndexPage() {
  return (
    <AppShell>
      <section className="border-b border-border/60 bg-card/20 px-5 py-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a case to view (or auto-generate) its signed incident report.
          </p>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-4 px-5 py-6 md:grid-cols-2">
        {DEMO_CASES.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle className="text-base">{c.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{c.summary}</p>
            </CardHeader>
            <CardContent>
              <Button asChild variant="cyan">
                <Link href={`/report/${c.id}`}>Open report</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
