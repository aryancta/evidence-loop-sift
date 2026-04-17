import type { Metadata } from "next";
import "@/styles/globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "EvidenceLoop SIFT — Autonomous DFIR Triage",
  description:
    "Evidence-first autonomous DFIR triage with auditable self-correction. Built for SOC responders and incident commanders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans scrollbar-thin">
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
