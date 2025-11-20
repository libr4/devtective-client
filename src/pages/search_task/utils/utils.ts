import { ProjectMember } from "../../common/types";

export function fromParams(params: URLSearchParams) {
  const getAll = (k: string) => params.getAll(k);
  return {
    q: params.get("q") ?? "",
    assignedTo: getAll("assignedTo") as ProjectMember[],
    type: getAll("type"),
    priority: getAll("priority"),
    status: getAll("status"),
    technology: getAll("technology"),
  };
}

export function toParams(obj: Record<string, string[] | string | undefined>) {
    console.log("TO PARAMS OBJ:", obj)
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (typeof v === "string" && v.trim()) sp.set(k, v);
    if (Array.isArray(v)) {
        if (k == 'assignedTo') {
        v.forEach((x) => x && sp.append(k, x.username as string));
        return;
    } 
        v.forEach((x) => x && sp.append(k, x));
}
  });
  return sp;
}