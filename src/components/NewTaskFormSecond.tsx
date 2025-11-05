import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
// 🔵 keep both query + mutation
import { useMutation, useQuery } from "@tanstack/react-query";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import CodeIcon from "@mui/icons-material/Code";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import DataObjectIcon from "@mui/icons-material/DataObject";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { ProjectMember } from "../pages/ProjectViewScreen";
import TipTapField from "./TipTapField";

type Member = { _id: string; name: string };

// 🔵 Backend DTO (keys as expected by the API)
type TaskRequestDTO = {
  title: string;
  description?: string | null;
  taskStatusId: string;
  taskPriorityId: string;
  taskTypeId: string;
  projectPublicId: string;
  technology?: string | null;
  assignedToId?: string | null;
  createdById?: string | null;
  deadline?: string | null; // ISO
  taskNumber?: number | null;
};

// 🔵 Labels keyed by DTO fields (for validation messages)
const LABELS: Record<keyof Partial<TaskRequestDTO>, string> = {
  title: "Título",
  taskTypeId: "Tipo",
  taskPriorityId: "Prioridade",
  description: "Descrição",
  assignedToId: "Atribuído para",
  taskStatusId: "Andamento",
  technology: "Tecnologia",
  deadline: "Prazo",
  projectPublicId: "Projeto",
};

function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

// 🔵 require the ID fields + title
function findMissingRequired(data: TaskRequestDTO): string[] {
  const required: (keyof TaskRequestDTO)[] = ["taskTypeId", "taskPriorityId", "title", "taskStatusId"];
  const missing: string[] = [];
  for (const k of required) {
    const v = (data as any)[k];
    if (v === undefined || v === null || String(v).trim() === "") {
      missing.push(LABELS[k] ?? (k as string));
    }
  }
  return missing;
}

/** API helpers + options are now ID-based */
type Opt = { value: string; label: string };

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

async function fetchTaskTypes(): Promise<Opt[]> {
  const { data } = await api.get("/api/v1/tasks/types");
  return normalizeOptions(data);
}

async function fetchTaskPriorities(): Promise<Opt[]> {
  const { data } = await api.get("/api/v1/tasks/priorities");
  return normalizeOptions(data);
}

async function fetchTaskStatus(): Promise<Opt[]> {
  const { data } = await api.get("/api/v1/tasks/status");
  return normalizeOptions(data);
}

export default function NewTaskFormSecond({
  setValidation,
}: {
  setValidation: (msg: string) => void;
}) {
  const navigate = useNavigate();
  const { projectId } = useParams();

  // fetch task metadata (cache for 5min)
  const staleTimeMs = 5 * 60_000;
  const {
    data: typeOptions,
    isLoading: typesLoading,
    error: typesError,
  } = useQuery({ queryKey: ["task-types"], queryFn: fetchTaskTypes, staleTime: staleTimeMs });

  const {
    data: priorityOptions,
    isLoading: prioritiesLoading,
    error: prioritiesError,
  } = useQuery({ queryKey: ["task-priorities"], queryFn: fetchTaskPriorities, staleTime: staleTimeMs });

  const {
    data: statusOptions,
    isLoading: statusLoading,
    error: statusError,
  } = useQuery({ queryKey: ["task-status"], queryFn: fetchTaskStatus, staleTime: staleTimeMs });

  const {data:memberDetails} = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      const res = await api.get<ProjectMember[]>(`/api/v1/projects/${projectId}/members`, {
        withCredentials: true,
      });
      return res.data;
    },
  });

  const metaLoading = typesLoading || prioritiesLoading || statusLoading;
  const metaError = (typesError || prioritiesError || statusError) as Error | undefined;

  const [deadline, setDeadline] = React.useState<Dayjs | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // 🔵 mutate with DTO shape
  const newTaskMutation = useMutation({
    mutationFn: async (dto: TaskRequestDTO) =>
      api.post(`/api/v1/projects/${projectId}/tasks`, dto),
    onSuccess: (res) =>
      navigate(`/${projectId}/task/${res?.data?.taskNumber}`, { state: res.data }),
  });

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // 🔵 Build DTO with backend keys + IDs
    const dto: TaskRequestDTO = {
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? "") || null,
      taskTypeId: String(fd.get("taskTypeId") ?? ""),
      taskPriorityId: String(fd.get("taskPriorityId") ?? ""),
      taskStatusId: String(fd.get("taskStatusId") ?? ""),
      projectPublicId: String(projectId ?? ""),
      technology: String(fd.get("technology") ?? "") || null,
      assignedToId: (String(fd.get("assignedToId") ?? "") || null) as string | null,
      createdById: null,
      deadline: deadline ? deadline.toDate().toISOString() : null,
      taskNumber: null,
    };

    const missing = findMissingRequired(dto);
    if (missing.length) {
      setValidation(`Preencha o(s) campo(s): ${missing.join(", ")}`);
      const nextErrors: Record<string, string> = {};
      for (const label of missing) {
        const key = Object.entries(LABELS).find(([, v]) => v === label)?.[0];
        if (key) nextErrors[key] = "Obrigatório";
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    newTaskMutation.mutate(dto);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Container maxWidth="md" sx={{ m:0, py: { xs: 0, md: 0, lg:0 },  px: { xs: 0, md: 0, lg:0 }}}>
        <Paper elevation={3} sx={{ p: { xs: 1, md: 2 } }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'inherit', textDecoration: 'none' }}
              variant="h5" fontWeight={700} color="primary.main">
              Nova Tarefa
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box component="form" noValidate onSubmit={onSubmit}>
            <Grid container spacing={2}>
              {/* Tipo (value = ID, name = taskTypeId) */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(errors.taskTypeId)} size="small" disabled={metaLoading}>
                  <InputLabel id="type-label">{LABELS.taskTypeId}</InputLabel>
                  <Select
                    labelId="type-label"
                    label={LABELS.taskTypeId}
                    name="taskTypeId"
                    defaultValue=""
                    displayEmpty
                  >
                    {metaLoading && <MenuItem value="" disabled>Carregando tipos...</MenuItem>}
                    {typeOptions?.map((o) => (
                      <MenuItem  key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.taskTypeId && <FormHelperText>{errors.taskTypeId}</FormHelperText>}
                  {typesError && <FormHelperText error>Falha ao carregar tipos</FormHelperText>}
                </FormControl>
              </Grid>

              {/* 🔵 Prioridade (value = ID, name = taskPriorityId) */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(errors.taskPriorityId)} size="small" disabled={metaLoading}>
                  <InputLabel id="priority-label">{LABELS.taskPriorityId}</InputLabel>
                  <Select
                    labelId="priority-label"
                    label={LABELS.taskPriorityId}
                    name="taskPriorityId"
                    defaultValue=""
                    displayEmpty
                  >
                    {metaLoading && <MenuItem value="" disabled>Carregando prioridades...</MenuItem>}
                    {priorityOptions?.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.taskPriorityId && <FormHelperText>{errors.taskPriorityId}</FormHelperText>}
                  {prioritiesError && <FormHelperText error>Falha ao carregar prioridades</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Título */}
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label={LABELS.title}
                  placeholder="Ex.: Corrigir erro no formulário de login"
                  fullWidth
                  size="small"
                  error={Boolean(errors.title)}
                  helperText={errors.title}
                />
              </Grid>

              {/* Descrição (HTML TipTap) */}
              <Grid item xs={12}>
                <TipTapField
                  name="description"
                  label={LABELS.description}
                  defaultValue={""}
                  ariaLabel="Editor de descrição"
                />
              </Grid>

              {/* Atribuído para (value = member id, name = assignedToId) */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="assigned-label">
                    {LABELS.assignedToId}
                  </InputLabel>
                  <Select
                    labelId="assigned-label"
                    label={LABELS.assignedToId}
                    name="assignedToId"
                    defaultValue=""
                    displayEmpty
                    disabled={!memberDetails?.length}
                  >
                    {memberDetails?.length === 0 ? (
                      <MenuItem value="" disabled>
                        Carregando membros...
                      </MenuItem>
                    ) : (
                      memberDetails?.map((m) => (
                        <MenuItem key={m.userPublicId} value={m.userPublicId}>
                          {m.displayName}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  <FormHelperText>
                    {memberDetails?.length
                      ? "Selecione um membro (opcional)."
                      : "Aguarde carregar os membros do projeto."}
                  </FormHelperText>
                </FormControl>
              </Grid>

              {/* Tecnologia */}
              <Grid item xs={12} md={6}>
                <TextField
                  name="technology"
                  label={LABELS.technology}
                  placeholder="Ex.: React, Spring Boot etc."
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* Andamento (value = ID, name = taskStatusId) */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(errors.taskStatusId)} size="small" disabled={metaLoading}>
                  <InputLabel id="status-label">{LABELS.taskStatusId}</InputLabel>
                  <Select
                    labelId="status-label"
                    label={LABELS.taskStatusId}
                    name="taskStatusId"
                    defaultValue=""
                    displayEmpty
                  >
                    {metaLoading && <MenuItem value="" disabled>Carregando status...</MenuItem>}
                    {statusOptions?.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.taskStatusId && <FormHelperText>{errors.taskStatusId}</FormHelperText>}
                  {statusError && <FormHelperText error>Falha ao carregar status</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Prazo */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label={LABELS.deadline}
                  value={deadline}
                  onChange={setDeadline}
                  slotProps={{
                    textField: {
                      name: "deadline-ui",
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12} md={12}>
                <Box sx={{ display: "flex", justifyContent: { xs: "stretch", md: "flex-end" } }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ minWidth: 180 }}
                    disabled={newTaskMutation.isPending || metaLoading}
                  >
                    {newTaskMutation.isPending ? "Enviando..." : "Enviar"}
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {metaError && (
              <Typography sx={{ mt: 2 }} color="error">
                Não foi possível carregar metadados da tarefa. Tente novamente.
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
