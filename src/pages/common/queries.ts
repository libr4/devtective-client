import api from "../../api/axios";

export type Opt = { value: string; label: string };

// Prefer IDs for values; fallback remains robust
function normalizeOptions(raw: any): Opt[] {
  if (!raw) return [];
  return (raw as any[]).map((item) => {
    if (typeof item === "string") {
      // If backend ever returns strings, use the same string for value/label (not ideal for IDs)
      return { value: item, label: item };
    }
    if (item && typeof item === "object") {
      const id = item.id ?? item.value ?? "";
      const name = item.name ?? item.label ?? item.description ?? String(id);
      return { value: String(id), label: String(name) };
    }
    return { value: String(item), label: String(item) };
  });
}

export async function fetchTaskTypes(): Promise<Opt[]> {
  const { data } = await api.get("/api/v1/tasks/types");
  return normalizeOptions(data);
}

export async function fetchTaskPriorities(): Promise<Opt[]> {
  const { data } = await api.get("/api/v1/tasks/priorities");
  return normalizeOptions(data);
}

export async function fetchTaskStatus(): Promise<Opt[]> {
  const { data } = await api.get("/api/v1/tasks/status");
  return normalizeOptions(data);
}