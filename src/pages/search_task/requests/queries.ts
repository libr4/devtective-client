import api from "../../../api/axios";
import { TaskRow } from "../types/Task";
import qs from "qs";


export const fetchFilters = async (projectId:string) => {
      const res = await api.get(`/api/v1/projects/${projectId}/filters`, { withCredentials: true });
      return res.data;
};

export const fetchTasks = async (projectId:string, params:any) => {
    const res = await api.get(`/api/v1/projects/${projectId}/tasks`, {
    withCredentials: true,
    params,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
    });
    // Normalize rows for DataGrid
    const rows: TaskRow[] = (Array.isArray(res.data) ? res.data : [])
    .filter(Boolean)
    .map((t: any) => ({
        id: Number(t.taskNumber ?? t.id),
        taskNumber: Number(t.taskNumber ?? t.id),
        title: t.title ?? "",
        description: t.description ?? "",
        priority: t.priority ?? "",
        status: t.status ?? "",
        type: t.type ?? "",
        technology: t.technology ?? "",
        deadline: t.deadline ?? null,
        assignedToFullName: Array.isArray(t.assignedTo)
        ? t.assignedToFullName
        : Array.isArray(t.members)
        ? t.members
        : Array.isArray(t.workerNames)
        ? t.workerNames
        : [],
    }));
    return rows;
}