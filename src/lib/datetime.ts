export function formatDateTime(date: Date | string, timezone: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: timezone, dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

export function formatDate(date: Date | string, timezone: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: timezone, dateStyle: "medium" }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}