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

export function formatTime(date: Date | string, timezone: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: true }).format(d);
  } catch {
    return d.toLocaleTimeString();
  }
}

export function formatWeekday(date: Date | string, timezone: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long" }).format(d);
  } catch {
    return "";
  }
}