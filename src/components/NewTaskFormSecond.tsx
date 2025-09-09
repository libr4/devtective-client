import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
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
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

type Member = { _id: string; name: string };

type NewTask = {
  type: string;
  priority: string;
  title: string;
  description?: string;
  assignedTo?: string;
  technology?: string;
  status: string;
  deadline?: string; // ISO string on submit
};

const LABELS: Record<keyof Partial<NewTask>, string> = {
  title: "Título",
  type: "Tipo",
  priority: "Prioridade",
  description: "Descrição",
  assignedTo: "Atribuído para",
  status: "Andamento",
  technology: "Tecnologia",
  deadline: "Prazo",
};

const PRIORIDADES = ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"] as const;
const STATUS = ["Aberta", "Desenvolvimento", "Teste", "Adiada", "Concluída", "Personalizada"] as const;
const TIPOS = ["Erro", "Bug", "Requisito", "Funcionalidade", "Atualização", "Personalizada"] as const;

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

function findMissingRequired(data: NewTask): string[] {
  const required: (keyof NewTask)[] = ["type", "priority", "title", "status"];
  const missing: string[] = [];
  for (const k of required) {
    const v = (data as any)[k];
    if (v === undefined || v === null || String(v).trim() === "") {
      missing.push(LABELS[k] ?? k);
    }
  }
  return missing;
}

export default function NewTaskFormSecond({
  setValidation,
}: {
  setValidation: (msg: string) => void;
}) {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const project = safeGetJSON<any>("currentProject", null);
  const memberDetails: Member[] = project?.memberDetails ?? [];

  // capture DatePicker separately (uncontrolled text inputs are still ok)
  const [deadline, setDeadline] = React.useState<Dayjs | null>(null);

  // Inline error flags for required fields
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const newTaskMutation = useMutation({
    mutationFn: async (data: NewTask) =>
      axios.post(`/api/v1/projects/${projectId}/tasks`, data),
    onSuccess: (res) =>
      navigate(`/${projectId}/task/${res?.data?.taskId}`, { state: res.data }),
  });

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Build payload from the form
    const payload: NewTask = {
      type: String(fd.get("type") ?? ""),
      priority: String(fd.get("priority") ?? ""),
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? ""),
      assignedTo: String(fd.get("assignedTo") ?? ""),
      technology: String(fd.get("technology") ?? ""),
      status: String(fd.get("status") ?? ""),
      deadline: deadline ? deadline.toDate().toISOString() : undefined,
    };

    // Validate required fields
    const missing = findMissingRequired(payload);
    if (missing.length) {
      setValidation(`Preencha o(s) campo(s): ${missing.join(", ")}`);
      const nextErrors: Record<string, string> = {};
      for (const label of missing) {
        // map back to field keys by label
        const key = Object.entries(LABELS).find(([, v]) => v === label)?.[0];
        if (key) nextErrors[key] = "Obrigatório";
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    newTaskMutation.mutate(payload);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Container maxWidth="md" sx={{ m:0, py: { xs: 0, md: 0, lg:0 },  px: { xs: 0, md: 0, lg:0 }}}>
        <Paper elevation={3} sx={{ p: { xs: 1, md: 2 } }}>
          <Box sx={{ mb: 2 }}>
            <Typography 
           sx={{
            //   display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }} 
            variant="h5" fontWeight={700} color="primary.main">
              Nova Tarefa
            </Typography>
            {/* <Typography variant="body2" color="text.secondary">
              Preencha os detalhes abaixo para criar uma nova tarefa.
            </Typography> */}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box component="form" noValidate onSubmit={onSubmit}>
            <Grid container spacing={2}>
              {/* Tipo */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(errors.type)} size="small">
                  <InputLabel id="type-label">{LABELS.type}</InputLabel>
                  <Select
                    labelId="type-label"
                    label={LABELS.type}
                    name="type"
                    defaultValue={TIPOS[0]}
                  >
                    {TIPOS.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Prioridade */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={Boolean(errors.priority)}
                  size="small"
                >
                  <InputLabel id="priority-label">{LABELS.priority}</InputLabel>
                  <Select
                    labelId="priority-label"
                    label={LABELS.priority}
                    name="priority"
                    defaultValue={"Média"}
                  >
                    {PRIORIDADES.map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.priority && (
                    <FormHelperText>{errors.priority}</FormHelperText>
                  )}
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

              {/* Descrição */}
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label={LABELS.description}
                  placeholder="Contexto, passos para reproduzir, etc."
                  fullWidth
                  size="small"
                  multiline
                  minRows={3}
                />
              </Grid>

              {/* Atribuído para */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="assigned-label">
                    {LABELS.assignedTo}
                  </InputLabel>
                  <Select
                    labelId="assigned-label"
                    label={LABELS.assignedTo}
                    name="assignedTo"
                    defaultValue=""
                    displayEmpty
                    disabled={!memberDetails.length}
                  >
                    {memberDetails.length === 0 ? (
                      <MenuItem value="" disabled>
                        Carregando membros...
                      </MenuItem>
                    ) : (
                      memberDetails.map((m) => (
                        <MenuItem key={m._id} value={m._id}>
                          {m.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  <FormHelperText>
                    {memberDetails.length
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
                  placeholder="Ex.: React, Spring Boot"
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* Andamento */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(errors.status)} size="small">
                  <InputLabel id="status-label">{LABELS.status}</InputLabel>
                  <Select
                    labelId="status-label"
                    label={LABELS.status}
                    name="status"
                    defaultValue={STATUS[0]}
                  >
                    {STATUS.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.status && (
                    <FormHelperText>{errors.status}</FormHelperText>
                  )}
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
                {/* We store deadline separately and serialize on submit */}
              </Grid>

              {/* Submit */}
              <Grid item xs={12} md={6} sx={{}}>
                <Box sx={{ display: "flex", justifyContent: { xs: "stretch", md: "flex-end" } }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ minWidth: 180 }}
                    disabled={newTaskMutation.isPending}
                  >
                    {newTaskMutation.isPending ? "Enviando..." : "Enviar"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
