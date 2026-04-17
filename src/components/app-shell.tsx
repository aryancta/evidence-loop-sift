"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileSearch,
  FolderKanban,
  Home,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Landing", icon: Home },
  { href: "/dashboard", label: "Investigation", icon: Activity },
  { href: "/cases", label: "Case Library", icon: FolderKanban },
  { href: "/report", label: "Report", icon: FileSearch },
  { href: "/admin/guardrails", label: "Guardrails", icon: ShieldCheck },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-background/80 p-4 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/15 border border-cyan-400/30">
            <Waypoints className="h-4 w-4 text-cyan-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">EvidenceLoop</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              SIFT
            </span>
          </div>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground",
                  active &&
                    "bg-cyan-500/10 text-cyan-200 border border-cyan-400/20 hover:bg-cyan-500/15 hover:text-cyan-100"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-md border border-border/60 bg-card/60 p-3 text-xs text-muted-foreground">
            <div className="mb-1 font-medium text-foreground">Demo mode</div>
            <p>No external API keys needed. All cases use bundled fixtures.</p>
          </div>
          <Badge variant="cyan" className="w-full justify-center py-1">
            v0.1 · hackathon build
          </Badge>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulseGlow" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              EvidenceLoop SIFT
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Autonomous DFIR triage · evidence-first reasoning
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="slate">MCP bound</Badge>
            <Badge variant="green">Guardrails on</Badge>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
