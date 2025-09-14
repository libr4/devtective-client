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
import { useState, useMemo, useEffect } from "react";
import { useAppContext } from "../context/AppProvider";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import SwitchableField, { FieldEditState } from "./SwitchableFieldSecond";

/* --------------------------------
 * Theme (module scope; no re-create)
 * --------------------------------*/
const theme = createTheme({
  palette: {
    primary: {
      main: "#00796b",
      light: "#48a999",
      dark: "#004c40",
      contrastText: "#ffffff",
    },
    background: {
      default: "hsl(144, 72%, 98%)",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 16 },
});

/* ----------------
 * Types & helpers
 * ----------------*/
type Task = {
  _id: string;
  taskNumber: string | number;
  title: string;
  type: string;
  priority: string;
  description: string;
  assignedTo: string;
  technology: string;
  status: string;
  deadline?: string; // ISO
  [k: string]: unknown;
};

export interface ITaskUpdateChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

interface ITaskUpdate {
  fromTask: string;
  fromProject: string;
  note?: string;
  author: string;
  changes: ITaskUpdateChange[];
}

/* Small layout helpers */
const rowSx = (minHeight = 50) => ({
  display: "flex",
  gap: 2,
  alignItems: "center",
  minHeight,
  px: 3,
  py: 2,
});

export default function TaskViewSecond() {
  const { state } = useLocation() as { state: Task | undefined };
  const { projectId } = useParams();
  const { currentUser, setCurrentTask } = useAppContext();

  // Guard: if navigation landed here without state, avoid crashes.
  const task = state;
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

  // Select options (memoized)
  const prioridades = useMemo(
    () => ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"] as const,
    []
  );
  const status = useMemo(
    () =>
      ["Aberta", "Desenvolvimento", "Teste", "Adiada", "Concluída", "Personalizada"] as const,
    []
  );
  const tipos = useMemo(
    () => ["Erro", "Bug", "Requisito", "Funcionalidade", "Atualização", "Personalizada"] as const,
    []
  );

  const taskActivityPost = useMutation({
    mutationFn: async (data: ITaskUpdate) => {
      const response = await axios.patch(
        `/api/v1/projects/${projectId}/tasks/${task?.taskId}`,
        data
      );
      return response;
    },
  });

  // Compare current form values with original task
  function prepareChanges(form: Record<string, FormDataEntryValue>): ITaskUpdateChange[] {
    if (!task) return [];
    const changes: ITaskUpdateChange[] = [];
    for (const key in form) {
      if (["_id", "note"].includes(key)) continue;

      const oldVal = task[key as keyof Task];
      const newVal = form[key];

      // Normalize strings & trim; allow empty string checks

      const oldStr = typeof oldVal === "string" ? oldVal : String(oldVal ?? "");
      const newStr = typeof newVal === "string" ? newVal : String(newVal ?? "");

      if (oldStr !== newStr) {
        changes.push({ field: key, oldValue: oldVal ?? "", newValue: newVal });
      }
    }
    return changes;
  }

  const handleSubmitActivity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!task || !projectId || !currentUser?._id) return;

    const fd = new FormData(event.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, FormDataEntryValue>;

    const changes = prepareChanges(data);
    const note = (data.note as string | undefined)?.trim();

    if (changes.length === 0 && !note) {
      // nothing to send
      return;
    }

    const payload: ITaskUpdate = {
      fromProject: projectId,
      fromTask: task._id,
      author: currentUser._id,
      changes,
      note,
    };
    taskActivityPost.mutate(payload);
  };

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
      <Box
        component="form"
        onSubmit={handleSubmitActivity}
        method="post"
        sx={{
          maxWidth: 800,
          width: "100%",
          mx: 0,
          px: 1, //{ xs: 1.5, sm: 2 },
          py: 1,
        }}
      >
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 1,
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, hsl(168, 45%, 97%), hsl(165, 50%, 95%))",
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
             #{task.taskNumber} - {task.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clique em um campo para editar. Use “Lançar movimentação” para salvar nota e
            alterações.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 0, border: "1px solid", borderColor: "divider",
            background:
              "linear-gradient(135deg, hsl(168, 45%, 97%), hsl(165, 50%, 95%))",
        }}>
          {/* Row 1 */}
          <Box sx={rowSx()}>
            <SwitchableField
              state={task}
              edit={edit}
              setEdit={setEdit}
              name="type"
              label="Tipo:"
              kind="select"
              selectItems={tipos as unknown as string[]}
              minLabelWidth={130}
            />
            <SwitchableField
              state={task}
              edit={edit}
              setEdit={setEdit}
              name="priority"
              label="Prioridade:"
              kind="select"
              selectItems={prioridades as unknown as string[]}
              minLabelWidth={130}
            />
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Row 2 */}
          <Box sx={rowSx()}>
            <SwitchableField
              state={task}
              edit={edit}
              setEdit={setEdit}
              name="assignedTo"
              label="Atribuído para:"
              kind="text"
              placeholder="Responsável"
              minLabelWidth={130}
            />
            <SwitchableField
              state={task}
              edit={edit}
              setEdit={setEdit}
              name="technology"
              label="Tecnologia:"
              kind="text"
              placeholder="Ex.: React, Java, PostgreSQL"
              minLabelWidth={130}
            />
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Row 3 */}
          <Box sx={rowSx()}>
            <SwitchableField
              state={task}
              edit={edit}
              setEdit={setEdit}
              name="status"
              label="Andamento:"
              kind="select"
              selectItems={status as unknown as string[]}
              minLabelWidth={130}
            />
            <SwitchableField
              state={task}
              edit={edit}
              setEdit={setEdit}
              name="deadline"
              label="Prazo:"
              kind="date"
              minLabelWidth={130}
            />
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Description */}
          <Box sx={{ ...rowSx(100), alignItems: "flex-start" }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 130 }}>
              <Typography
                onClick={() => setEdit({ ...edit, description: true })}
                sx={{ fontWeight: 500, cursor: "pointer" }}
              >
                Descrição:
              </Typography>
              {edit.description && (
                <Button
                  onClick={() => setEdit({ ...edit, description: false })}
                  size="small"
                  aria-label="Fechar edição de descrição"
                >
                  <CloseIcon color="primary" />
                </Button>
              )}
            </Stack>

            {!edit.description ? (
              <Tooltip title="Clique para editar">
                <Typography
                  onClick={() => setEdit({ ...edit, description: true })}
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    whiteSpace: "pre-wrap",
                    color: "text.primary",
                  }}
                >
                  {task.description || "—"}
                </Typography>
              </Tooltip>
            ) : (
              <Box sx={{ flex: 1 }}>
                {/* Keep using native form submit via name/value */}
                <textarea
                  name="description"
                  defaultValue={task.description}
                  rows={5}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.2)",
                    background: "#fff",
                    fontFamily: "inherit",
                    fontSize: "0.95rem",
                    lineHeight: 1.5,
                  }}
                />
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Activity note */}
          <Box sx={{ ...rowSx(100), alignItems: "flex-start" }}>
            <Typography sx={{ minWidth: 130, fontWeight: 500 }}>
              Nota da atividade:
            </Typography>
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0, pt:0, pr:2, pb:3 }}>
            <Button type="submit" variant="contained" size="large">
              Lançar movimentação
            </Button>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
