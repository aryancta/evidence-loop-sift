export function fmtTime(iso: string | undefined | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toISOString().replace("T", " ").replace("Z", "Z");
  } catch {
    return String(iso);
  }
}

export function fmtTimeShort(iso: string | undefined | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const h = String(d.getUTCHours()).padStart(2, "0");
    const m = String(d.getUTCMinutes()).padStart(2, "0");
    const s = String(d.getUTCSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  } catch {
    return String(iso);
  }
}

export function fmtConfidence(c: number) {
  return `${Math.round(c * 100)}%`;
}

export function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
