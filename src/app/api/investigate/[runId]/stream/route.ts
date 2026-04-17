import { eventsForRun, snapshotForRun, subscribe } from "@/lib/agent/run-loop";
import type { SseEvent } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { runId: string } }) {
  const runId = params.runId;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();

      const send = (ev: SseEvent) => {
        const payload = `event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`;
        try {
          controller.enqueue(enc.encode(payload));
        } catch {
          // client gone
        }
      };

      const snapshot = snapshotForRun(runId);
      if (!snapshot) {
        controller.enqueue(
          enc.encode(`event: error\ndata: ${JSON.stringify({ error: "Run not found" })}\n\n`)
        );
        controller.close();
        return;
      }

      send({ type: "snapshot", runId, timestamp: new Date().toISOString(), data: snapshot });
      for (const ev of eventsForRun(runId)) send(ev);

      const unsubscribe = subscribe(runId, (ev) => {
        send(ev);
        if (ev.type === "complete") {
          setTimeout(() => {
            try {
              controller.close();
            } catch {}
            unsubscribe();
          }, 100);
        }
      });

      const hb = setInterval(() => {
        try {
          controller.enqueue(enc.encode(": hb\n\n"));
        } catch {
          clearInterval(hb);
        }
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
