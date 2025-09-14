import * as React from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import { Form } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type User = {
  _id: string;        // using your current id for now
  name: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
};

type Workspace = {
  id: string;         // public UUID preferred; maps from backend (publicId or id)
  name: string;
};

type CreateProjectPayload = {
  name: string;
  description?: string;
  start?: string | null;
  end?: string | null;
  leaderIds: string[];
  memberIds: string[];
  workspaceId: string; // NEW: required
};

type CreateProjectResponse = {
  id?: string;
  projectId?: string;
  name: string;
};

export default function NewProjectPage() {
  const qc = useQueryClient();

  const [leaders, setLeaders] = React.useState<string[]>([]);
  const [members, setMembers] = React.useState<string[]>([]);
  const [start, setStart] = React.useState<Dayjs | null>(null);
  const [end, setEnd] = React.useState<Dayjs | null>(null);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [validation, setValidation] = React.useState<string | null>(null);

  // NEW: workspace state
  const [selectedWs, setSelectedWs] = React.useState<Workspace | null>(null);
  const [newWsName, setNewWsName] = React.useState("");
  const [wsInput, setWsInput] = React.useState("");
  const [createdWs, setCreatedWs] = React.useState(false);

  // --- Queries ---------------------------------------------------------------
  const usersQuery = useQuery({
    queryKey: ["users-for-project"],
    queryFn: async () => {
      const res = await axios.get<User[]>("/api/v1/users", { withCredentials: true });
      return res.data.filter((u) => !!u.name);
    },
  });

  const meQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await axios.get<User>("/api/v1/users/me", { withCredentials: true });
      return res.data;
    },
  });

  // NEW: workspaces list (owned/visible to the user)
  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await axios.get<Array<{ id?: string; publicId?: string; name: string }>>(
        "/api/v1/workspaces/me",
        { withCredentials: true }
      );
      // normalize id field to .id (prefer publicId)
      return res.data.map((w) => ({ id: w.publicId ?? w.id!, name: w.name })) as Workspace[];
    },
  });

  // Ensure current user is leader by default
  React.useEffect(() => {
    const me = meQuery.data?._id;
    if (me && leaders.length === 0) setLeaders([me]);
  }, [meQuery.data, leaders.length]);

  // Preselect a workspace (PUBLIC_DEMO if present; else first)
  React.useEffect(() => {
    const list = workspacesQuery.data ?? [];
    if (!selectedWs && list.length) {
      const demo =
        list.find((w) => w.name === "PUBLIC_DEMO") ||
        list.find((w) => /demo/i.test(w.name));
      setSelectedWs(demo || list[0]);
    }
  }, [workspacesQuery.data, selectedWs]);

  // --- Mutations -------------------------------------------------------------
  const createMutation = useMutation({
    mutationKey: ["create-project"],
    mutationFn: async (payload: CreateProjectPayload) => {
      const res = await axios.post<CreateProjectResponse>("/api/v1/projects", payload, {
        withCredentials: true,
      });
      return res.data;
    },
    onError: (err: any) => {
      console.error(err);
      setValidation("Ocorreu um erro ao criar o projeto. Tente novamente.");
    },
    onSuccess: () => {
      setValidation(null);
      // navigate after success if you want
    },
  });

  // NEW: create workspace inline
  const createWorkspaceMutation = useMutation({
    mutationKey: ["create-workspace"],
    mutationFn: async (name: string) => {
      console.log('MUTATION TRIGGERED!')
      const res = await axios.post<{ id?: string; publicId?: string; name: string }>(
        "/api/v1/workspaces",
        { name },
        { withCredentials: true }
      );
      return { id: res.data.publicId ?? res.data.id!, name: res.data.name } as Workspace;
    },
    onSuccess: async (ws) => {
      setSelectedWs(ws);
      setNewWsName("");
      setCreatedWs(true)
      await qc.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: () => setValidation("Não foi possível criar o workspace."),
  });

  // --- Helpers ---------------------------------------------------------------
  const allUsers = usersQuery.data ?? [];
  const currentUserId = meQuery.data?._id;

  const leaderOptions = allUsers;
  const memberOptions = allUsers;

  const leaderValue = leaderOptions.filter((u) => leaders.includes(u._id));
  const memberValue = memberOptions.filter((u) => members.includes(u._id));

  const usersLoading = usersQuery.isLoading;
  const creating = createMutation.isPending;
  const wsLoading = workspacesQuery.isLoading || createWorkspaceMutation.isPending;

  function ensureSelfIsLeader(nextIds: string[]) {
    if (!currentUserId) return nextIds;
    return nextIds.includes(currentUserId) ? nextIds : [currentUserId, ...nextIds];
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setValidation("Preencha o campo: Título");
      return;
    }
    if (!selectedWs) {
      setValidation("Selecione ou crie um Workspace.");
      return;
    }
    if (!leaders.length || (currentUserId && !leaders.includes(currentUserId))) {
      setValidation("Você deve ser um(a) dos(as) líderes do projeto.");
      setLeaders((prev) => ensureSelfIsLeader(prev));
      return;
    }
    if (end && start && end.isBefore(start)) {
      setValidation("A data de fim deve ser posterior à data de início.");
      return;
    }

    const payload: CreateProjectPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      start: start ? start.toDate().toISOString() : null,
      end: end ? end.toDate().toISOString() : null,
      leaderIds: Array.from(new Set(ensureSelfIsLeader(leaders))),
      memberIds: Array.from(new Set(members)),
      workspaceId: selectedWs.id, // NEW
    };

    createMutation.mutate(payload);
  }

  function handleCopyInviteLink() {
    const link = "https://app.devtective.io/invite/coming-soon";
    navigator.clipboard.writeText(link);
    setValidation("Link de convite copiado (funcionalidade em breve).");
  }

  // --- UI --------------------------------------------------------------------
  return (
    <LocalizationProvider adapterLocale="pt-br" dateAdapter={AdapterDayjs}>
      <Container maxWidth="md" disableGutters sx={{ m: 0 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Novo Projeto
          </Typography>

          {validation && (
            <Alert severity="error" onClose={() => setValidation(null)} sx={{ mb: 2 }}>
              {validation}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} method="post">
            <Stack spacing={3}>
              {/* Informações básicas */}
              <Box>
                <Divider sx={{ mt: 0.5, mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Título*"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Descrição"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      fullWidth
                      size="small"
                      multiline
                      minRows={4}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Workspace */}
              {/* Workspace (one-field + creatable) */}
              <Box>
                <Divider sx={{ mt: 0.5, mb: 2 }} />
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} md={8}>
                    <Autocomplete
                      freeSolo
                      options={workspacesQuery.data ?? []}
                      value={selectedWs}
                      inputValue={wsInput}
                      onInputChange={(_, v) => {
                        setWsInput(v);
                        // if user typed an existing name, auto-select it
                        const match = (workspacesQuery.data ?? []).find(
                          (w) => w.name.toLowerCase().trim() === v.toLowerCase().trim()
                        );
                        if (match) setSelectedWs(match);
                      }}
                      onChange={(_, v) => {
                        // v can be Workspace | string | null (because freeSolo)
                        if (v && typeof v !== "string") {
                          setSelectedWs(v);
                          setWsInput(v.name);
                        }
                      }}
                      getOptionLabel={(o) => (typeof o === "string" ? o : o?.name ?? "")}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      loading={workspacesQuery.isLoading || createWorkspaceMutation.isPending}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Workspace*"
                          placeholder="Selecione ou digite para criar"
                          size="small"
                        />
                      )}
                      disabled={workspacesQuery.isLoading || createWorkspaceMutation.isPending}
                    />
                    {/* <Typography variant="caption" color="text.secondary">
                      O projeto pertence a um único workspace. Digite para buscar ou criar um novo.
                    </Typography> */}
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      size="medium"
                      fullWidth
                      onClick={() => {return createWorkspaceMutation.mutate(wsInput.trim())}}
                      disabled={
                        createdWs || !wsInput.trim() ||
                        (workspacesQuery.data ?? []).some(
                          (w) => w.name.toLowerCase().trim() === wsInput.toLowerCase().trim()
                        ) ||
                        createWorkspaceMutation.isPending
                      }
                    >
                      {createdWs ? "Workspace criado!" : createWorkspaceMutation.isPending ? "Criando..." : `Criar “${wsInput || "workspace"}”`}
                    </Button>
                    {/* <Typography variant="caption" color="text.secondary">
                      O botão ativa quando o nome não existe.
                    </Typography> */}
                  </Grid>
                </Grid>
              </Box>


              {/* Equipe */}
              <Box>
                <Divider sx={{ mt: 0.5, mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <Autocomplete
                      multiple
                      options={leaderOptions}
                      value={leaderValue}
                      getOptionLabel={(o) => o.name || o.username || o.email || "Usuário"}
                      onChange={(_, value) => {
                        const next = value.map((v) => v._id);
                        setLeaders(ensureSelfIsLeader(next));
                      }}
                      disableCloseOnSelect
                      loading={usersQuery.isLoading}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const isSelf = option._id === currentUserId;
                          const tagProps = getTagProps({ index });
                          return (
                            <Chip
                              {...tagProps}
                              key={option._id}
                              label={option.name}
                              onDelete={
                                isSelf && value.length === 1 ? undefined : tagProps.onDelete
                              }
                              sx={{ "& .MuiChip-icon": { mr: 0.5 } }}
                            />
                          );
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Líder(es)"
                          placeholder="Adicionar líder"
                          size="small"
                        />
                      )}
                      disabled={usersLoading}
                    />
                    {/* <Typography variant="caption" color="text.secondary">
                      Você é líder por padrão. Pelo menos um(a) líder é obrigatório.
                    </Typography> */}
                  </Grid>

                  <Grid item xs={12} md={7}>
                    <Autocomplete
                      multiple
                      options={memberOptions}
                      value={memberValue}
                      getOptionLabel={(o) => o.name || o.username || o.email || "Usuário"}
                      onChange={(_, value) => setMembers(value.map((v) => v._id))}
                      disableCloseOnSelect
                      loading={usersQuery.isLoading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Convidar membros (opcional)"
                          placeholder="Convidar membros"
                          size="small"
                        />
                      )}
                      disabled={usersLoading}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Datas */}
              <Box>
                <Divider sx={{ mt: 0.5, mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Início do Projeto"
                      value={start}
                      onChange={(v) => setStart(v)}
                      slotProps={{ textField: { fullWidth: true, size: "small" } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Fim do Projeto"
                      value={end}
                      onChange={(v) => setEnd(v)}
                      minDate={start ?? dayjs().subtract(200, "year")}
                      slotProps={{ textField: { fullWidth: true, size: "small" } }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Ações */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md="auto">
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={usersLoading || creating || wsLoading}
                  >
                    {createMutation.isPending ? "Criando..." : "Criar projeto"}
                  </Button>
                </Grid>
                <Grid item xs={12} md="auto">
                  <Tooltip
                    title="Crie o projeto primeiro para liberar o link (funcionalidade em breve)"
                    arrow
                  >
                    <span>
                      <Button
                        variant="text"
                        size="large"
                        onClick={handleCopyInviteLink}
                        disabled={creating}
                      >
                        Copiar link de convite
                      </Button>
                    </span>
                  </Tooltip>
                </Grid>
                {createMutation.isError && (
                  <Grid item xs={12}>
                    <Typography color="error" variant="body2">
                      Não foi possível criar o projeto. Verifique os dados e tente novamente.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Stack>
          </Form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
