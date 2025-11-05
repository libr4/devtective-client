import * as React from "react";
import {
  Box,
  Button,
  Divider,
  Paper,
  ThemeProvider,
  Typography,
  createTheme,
  Tooltip,
  Stack,
} from "@mui/material";
import { useLocation, useParams } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useMemo, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import api from "../api/axios";
import SwitchableField, { FieldEditState } from "./SwitchableFieldSecond";
import DOMPurify from "dompurify";

import FieldsRow from "./TaskViewFieldRow";
import { rowSx } from "./utils";
import RichTextEditor from "./RichTextEditor";

/* --------------------------------
 * Theme (module scope; no re-create)
 * --------------------------------*/
const theme = createTheme({
  palette: {
    primary: { main: "#00796b", light: "#48a999", dark: "#004c40", contrastText: "#ffffff" },
    background: { default: "hsl(144, 72%, 98%)", paper: "#ffffff" },
  },
  shape: { borderRadius: 16 },
});

/* ----------------
 * Types & helpers
 * ----------------*/
type Task = {
  _id: string;
  taskId?: string; // in case you pass it in state
  taskNumber: string | number;
  title: string;
  type: string;       // name
  priority: string;   // name
  description: string; // HTML
  assignedTo: string;
  technology: string;
  status: string;     // name
  deadline?: string;  // ISO
  [k: string]: unknown;
};

export interface ITaskUpdateChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

interface ITaskUpdate {
  taskNumber: string;
  projectId: string;
  note?: string;
  authorId: string;
  changes: ITaskUpdateChange[];
}

export default function TaskViewSecond({taskData}: { taskData?: Task }) {
  const { state } = useLocation() as { state: Task | undefined };
  const { projectId } = useParams();
  const { currentUser, setCurrentTask } = useAppContext();

  console.log('TaskViewSecond state:', state, '\ntaskData:', taskData, 'projectId:', projectId);

  // Guard: if navigation landed here without state, avoid crashes.
  const task = taskData;
  useEffect(() => {
    if (task) setCurrentTask(task);
  }, [task, setCurrentTask]);

  // Edit state
  const initialEdit: FieldEditState = useMemo(
    () => ({
      type: false,
      priority: false,
      description: false,
      assignedTo: false,
      technology: false,
      status: false,
      deadline: false,
    }),
    []
  );
  const [edit, setEdit] = useState<FieldEditState>(initialEdit);

  // ------- FETCH LOOKUPS (GET) -------
  type IdName = { id: number; name: string };
  const staleTimeMs = 5 * 60_000;

  const { data: typesRes } = useQuery({
    queryKey: ["task-types"],
    queryFn: async (): Promise<IdName[]> => (await api.get("/api/v1/tasks/types")).data,
    // staleTime: staleTimeMs,
  });

  const { data: prioritiesRes } = useQuery({
    queryKey: ["task-priorities"],
    queryFn: async (): Promise<IdName[]> => (await api.get("/api/v1/tasks/priorities")).data,
    // staleTime: staleTimeMs,
  });

  const { data: statusRes } = useQuery({
    queryKey: ["task-status"],
    queryFn: async (): Promise<IdName[]> => (await api.get("/api/v1/tasks/status")).data,
    // staleTime: staleTimeMs,
  });

  // Map to names (keeps SwitchableField contract as string[])
  const tipos = useMemo(() => (typesRes ? typesRes.map(o => o.name) : []), [typesRes]);
  const prioridades = useMemo(() => (prioritiesRes ? prioritiesRes.map(o => o.name) : []), [prioritiesRes]);
  const status = useMemo(() => (statusRes ? statusRes.map(o => o.name) : []), [statusRes]);

  // Quick lookup maps to convert name -> id for PUT
  const typeNameToId = useMemo(() => {
    const m = new Map<string, number>();
    typesRes?.forEach(o => m.set(o.name, o.id));
    return m;
  }, [typesRes]);

  const priorityNameToId = useMemo(() => {
    const m = new Map<string, number>();
    prioritiesRes?.forEach(o => m.set(o.name, o.id));
    return m;
  }, [prioritiesRes]);

  const statusNameToId = useMemo(() => {
    const m = new Map<string, number>();
    statusRes?.forEach(o => m.set(o.name, o.id));
    return m;
  }, [statusRes]);

  // ------- MUTATIONS (PUT + PATCH) -------
  const updateTask = useMutation({
    mutationFn: async (partial: any) =>
      api.put(`/api/v1/projects/${projectId}/tasks/${task?.taskId ?? task?._id}`, partial),
  });

  const taskActivityPost = useMutation({
    mutationFn: async (data: ITaskUpdate) =>
      api.patch(`/api/v1/projects/${projectId}/tasks/${task?.taskId ?? task?._id}`, data),
  });

  // Compare current form values with original task
  function prepareChanges(form: Record<string, FormDataEntryValue>): ITaskUpdateChange[] {
    if (!task) return [];
    const changes: ITaskUpdateChange[] = [];
    for (const key in form) {
      if (["id", "note"].includes(key)) continue;

      const oldVal = task[key as keyof Task];
      const newVal = form[key];

      const oldStr = typeof oldVal === "string" ? oldVal : String(oldVal ?? "");
      const newStr = typeof newVal === "string" ? newVal : String(newVal ?? "");

      if (oldStr !== newStr) {
        changes.push({ field: key, oldValue: oldVal ?? "", newValue: newVal });
      }
    }
    return changes;
  }

  function buildPutBodyFromChanges(changes: ITaskUpdateChange[]) {
    const body: Record<string, any> = {};
    for (const c of changes) {
      const k = c.field;
      const v = c.newValue;

      if (k === "type") {
        const id = typeof v === "string" ? typeNameToId.get(v) : undefined;
        if (id != null) body.typeId = id; else body.type = v; // fallback if backend still accepts names
      } else if (k === "priority") {
        const id = typeof v === "string" ? priorityNameToId.get(v) : undefined;
        if (id != null) body.priorityId = id; else body.priority = v;
      } else if (k === "status") {
        const id = typeof v === "string" ? statusNameToId.get(v) : undefined;
        if (id != null) body.statusId = id; else body.status = v;
      } else if (k === "deadline") {
        // Expecting ISO from the input; if your control provides a date-only string, adapt here
        body.deadline = v;
      } else if (k === "description" || k === "title" || k === "technology" || k === "assignedTo") {
        body[k] = v;
      }
      // ignore any unknown fields silently
    }
    return body;
  }

  const handleSubmitActivity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!task || !projectId || !currentUser?.publicId) return;

    const fd = new FormData(event.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, FormDataEntryValue>;

    const changes = prepareChanges(data);
    const note = (data.note as string | undefined)?.trim();

    if (changes.length === 0 && !note) {
      return; // nothing to send
    }

    // 1) PUT the actual task updates (only the fields that changed)
    const putBody = buildPutBodyFromChanges(changes);
    if (Object.keys(putBody).length > 0) {
      await updateTask.mutateAsync(putBody);
    }

    // 2) PATCH an activity log (optional, keeps your history)
    const payload: ITaskUpdate = {
      fromProject: projectId!,
      fromTask: task.taskNumber,
      author: currentUser._id,
      changes,
      note,
    };
    await taskActivityPost.mutateAsync(payload);

    // Optionally collapse edit mode after save
    setEdit(initialEdit);
  };

  // Sanitize description before rendering to prevent XSS
  const safeDescription = useMemo(() => {
    const raw = task?.description ?? "";
    if (!raw || raw.trim() === "") return "—";
    return DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "b", "i", "code", "ul", "ol", "li", "u"],
      ALLOWED_ATTR: [],
    });
  }, [task?.description]);

  if (!task) {
    return (
      <ThemeProvider theme={theme}>
        <Paper elevation={0} sx={{ p: 4, mx: "auto" }}>
          <Typography variant="h6" color="text.secondary">
            Nenhuma tarefa selecionada. Volte e escolha uma tarefa para visualizar/editar.
          </Typography>
        </Paper>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box component="form" onSubmit={handleSubmitActivity} method="post" sx={{ maxWidth: 800, width: "100%", mx: 0, px: 1, py: 1 }}>
        {/* Header */}
        <Paper elevation={3} sx={{ p: 2, mb: 1, border: "1px solid", borderColor: "divider",
          background: "linear-gradient(135deg, hsl(168, 45%, 97%), hsl(165, 50%, 95%))" }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            #{task.taskNumber} - {task.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clique em um campo para editar. Use “Atualizar” para salvar nota e alterações.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 0, border: "1px solid", borderColor: "divider",
          background: "linear-gradient(135deg, hsl(168, 45%, 97%), hsl(165, 50%, 95%))" }}>
          {/* Row 1 */}
          <FieldsRow
            state={task}
            edit={edit}
            setEdit={setEdit}
            fields={[
              {
                name: "taskTypeName",
                label: "Tipo:",
                kind: "select",
                selectItems: tipos as unknown as string[],
                minLabelWidth: 130,
              },
              {
                name: "taskPriorityName",
                label: "Prioridade:",
                kind: "select",
                selectItems: prioridades as unknown as string[],
                minLabelWidth: 130,
              },
            ]}
          />
          <Divider sx={{ my: 0.5 }} />

          {/* Row 2 */}
          <FieldsRow
            state={task}
            edit={edit}
            setEdit={setEdit}
            fields={[
              {
                name: "assignedToFullName",
                label: "Atribuído para:",
                kind: "text",
                placeholder: "Responsável",
                minLabelWidth: 130,
              },
              {
                name: "technologyName",
                label: "Tecnologia:",
                kind: "text",
                placeholder: "Ex.: React, Java, PostgreSQL",
                minLabelWidth: 130,
              },
            ]}
          />

          <Divider sx={{ my: 0.5 }} />

          {/* Row 3 */}
          <FieldsRow
            state={task}
            edit={edit}
            setEdit={setEdit}
            fields={[
              {
                name: "taskStatus",
                label: "Andamento:",
                kind: "select",
                selectItems: status as unknown as string[],
                minLabelWidth: 130,
              },
              {
                name: "deadline",
                label: "Prazo:",
                kind: "date",
                minLabelWidth: 130,
              },
            ]}
          />

          <Divider sx={{ my: 0.5 }} />

          {/* Description */}
          <Box sx={{ ...rowSx(100), alignItems: "flex-start" }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 130 }}>
              <Typography onClick={() => setEdit({ ...edit, description: true })} sx={{ fontWeight: 500, cursor: "pointer" }}>
                Descrição:
              </Typography>
              {edit.description && (
                <Button onClick={() => setEdit({ ...edit, description: false })} size="small" aria-label="Fechar edição de descrição">
                  <CloseIcon color="primary" />
                </Button>
              )}
            </Stack>

            {!edit.description ? (
              <Tooltip title="Clique para editar">
                <Box
                  onClick={() => setEdit({ ...edit, description: true })}
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    color: "text.primary",
                    "& code": {
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                      background: "rgba(0,0,0,0.06)",
                      borderRadius: "6px",
                      padding: "0.08rem 0.35rem",
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: safeDescription }}
                />
              </Tooltip>
            ) : (
              <Box sx={{ flex: 1 }}>
                <RichTextEditor name="description" defaultValue={task.description} ariaLabel="Editor de descrição" />
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Activity note */}
          <Box sx={{ ...rowSx(100), alignItems: "flex-start" }}>
            <Typography sx={{ minWidth: 130, fontWeight: 500 }}>Nota da atividade:</Typography>
            <Box sx={{ flex: 1 }}>
              <textarea
                name="note"
                placeholder="Nota sobre as mudanças feitas."
                rows={4}
                style={{
                  width: "100%",
                  padding: 0,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.2)",
                  background: "#fff",
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                }}
              />
            </Box>
          </Box>

          {/* Footer actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0, pt: 0, pr: 2, pb: 3 }}>
            <Button type="submit" variant="contained" size="large">
              Atualizar
            </Button>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
