import * as React from "react";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Button,
  Skeleton,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAppContext } from "../context/AppProvider";

/* ---------------- Style: keep it consistent with TaskViewSecond ---------------- */
const theme = createTheme({
  palette: {
    primary: { main: "#00796b", light: "#48a999", dark: "#004c40", contrastText: "#fff" },
    background: { default: "hsl(144, 72%, 98%)", paper: "#fff" },
  },
  shape: { borderRadius: 16 },
});

type PublicUser = {
  _id: string;
  name: string;
  username: string;
  email?: string;
  position?: string;          // “papel” no ciclo de dev
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  joinedAt?: string;          // ISO
  stats?: {
    projects?: number;
    openTasks?: number;
    doneTasks?: number;
  };
  recentProjects?: Array<{ id: string | number; name: string; role?: string }>;
  recentActivity?: Array<{ id: string | number; when: string; text: string }>;
};

function maskEmail(email?: string) {
  if (!email) return "—";
  const [u, d] = email.split("@");
  if (!u || !d) return email;
  const masked = u.length <= 2 ? u[0] + "*" : u.slice(0, 2) + "*".repeat(Math.max(1, u.length - 2));
  return `${masked}@${d}`;
}

export default function UserPublicProfilePage() {
  const { userId } = useParams();
  const nav = useNavigate();
  const { currentUser } = useAppContext();

  const effectiveId = userId ?? currentUser?._id ?? "me";

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["user-profile", effectiveId],
    queryFn: async (): Promise<PublicUser> => {
      // Ajuste: se sua API usa /api/v1/users/:id para qualquer id e /me para o próprio
      const url = userId ? `/api/v1/users/${userId}` : `/api/v1/users/me`;
      const res = await axios.get(url, { withCredentials: true });
      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const isSelf = !userId || userId === currentUser?._id;

  const onCopyEmail = async () => {
    if (!profile?.email) return;
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {}
  };

  const headerBg =
    "linear-gradient(135deg, hsl(168, 45%, 97%), hsl(165, 50%, 95%))";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 1100, mx: 0, px: { xs: 1, sm: 1 }, py: 2 }}>
        {/* Top skeleton/loader */}
        {(isLoading) && <LinearProgress sx={{ mb: 2 }} />}

        {/* Header / Cover */}
        <Paper
          elevation={3}
          sx={{
            p: 0,
            mb: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            background: headerBg,
          }}
        >
          <Box
            sx={{
              height: 110,
              background:
                "radial-gradient(1200px 250px at 10% -10%, rgba(0,121,107,0.10), transparent), radial-gradient(800px 260px at 90% 0%, rgba(0,121,107,0.08), transparent)",
            }}
          />
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2, mt: -7 }}>
            <Stack direction="row" spacing={2} alignItems="flex-end">
              {isLoading ? (
                <Skeleton variant="circular" width={96} height={96} sx={{ border: "2px solid #fff", borderRadius: "50%" }} />
              ) : (
                <Avatar
                  src={profile?.avatarUrl}
                  alt={profile?.name ?? "avatar"}
                  sx={{
                    width: 96,
                    height: 96,
                    border: "3px solid #fff",
                    boxShadow: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontSize: 36,
                    fontWeight: 700,
                  }}
                >
                  {(profile?.name ?? "?").slice(0, 1).toUpperCase()}
                </Avatar>
              )}

              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={800}>
                  {isLoading ? <Skeleton width={240} /> : profile?.name ?? "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isLoading ? <Skeleton width={160} /> : (profile?.position || "—")} • @{isLoading ? <Skeleton width={80} /> : (profile?.username || "—")}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ pb: 0.5 }}>
                {!isLoading && profile?.email && (
                  <Tooltip title={profile.email}>
                    <Chip
                      icon={<EmailIcon fontSize="small" />}
                      label={maskEmail(profile.email)}
                      variant="outlined"
                      sx={{ bgcolor: "#fff" }}
                    />
                  </Tooltip>
                )}
                <Tooltip title="Copiar e-mail">
                  <span>
                    <IconButton size="small" onClick={onCopyEmail} disabled={!profile?.email}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Copiar link do perfil">
                  <IconButton
                    size="small"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                      } catch {}
                    }}
                  >
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {isSelf && (
                  <Tooltip title="Editar perfil">
                    <IconButton size="small" onClick={() => nav("/user/settings")}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Entrou em:{" "}
                {isLoading ? (
                  <Skeleton width={100} component="span" />
                ) : profile?.joinedAt ? (
                  new Date(profile.joinedAt).toLocaleDateString()
                ) : (
                  "—"
                )}
              </Typography>
            </Stack>
          </Box>
        </Paper>

        <Grid container spacing={2}>
          {/* Left column: About + Skills + Stats */}
          <Grid item xs={12} md={4}>
            {/* About */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                border: "1px solid",
                borderColor: "divider",
                background: headerBg,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Sobre
              </Typography>
              {isLoading ? (
                <Stack spacing={1}>
                  <Skeleton width="90%" />
                  <Skeleton width="85%" />
                  <Skeleton width="70%" />
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {profile?.bio || "Ainda não há uma bio por aqui."}
                </Typography>
              )}
            </Paper>

            {/* Skills */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                border: "1px solid",
                borderColor: "divider",
                background: headerBg,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Competências
              </Typography>
              {isLoading ? (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" width={80} height={28} />
                  ))}
                </Stack>
              ) : (profile?.skills?.length ? (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {profile.skills!.map((s) => (
                    <Chip key={s} label={s} size="small" />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">—</Typography>
              ))}
            </Paper>

            {/* Stats */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                border: "1px solid",
                borderColor: "divider",
                background: headerBg,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Estatísticas
              </Typography>
              <Grid container spacing={1}>
                {[
                  { label: "Projetos", value: profile?.stats?.projects ?? 0 },
                  { label: "Tarefas Abertas", value: profile?.stats?.openTasks ?? 0 },
                  { label: "Concluídas", value: profile?.stats?.doneTasks ?? 0 },
                ].map((it) => (
                  <Grid item xs={4} key={it.label}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 1.2, textAlign: "center", borderRadius: 2, bgcolor: "#fff" }}
                    >
                      <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
                        {isLoading ? <Skeleton width={28} /> : it.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {it.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Contact quick action */}
            {!isSelf && (
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mb: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  background: headerBg,
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Contato
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<EmailIcon />}
                    onClick={() => {
                      if (profile?.email) window.location.href = `mailto:${profile.email}`;
                    }}
                    disabled={!profile?.email}
                  >
                    Enviar e-mail
                  </Button>
                </Stack>
              </Paper>
            )}
          </Grid>

          {/* Right column: Projects + Activity */}
          <Grid item xs={12} md={8}>
            {/* Projects */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                border: "1px solid",
                borderColor: "divider",
                background: headerBg,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight={700}>
                  Projetos recentes
                </Typography>
                {isSelf && (
                  <Button size="small" onClick={() => nav("/projetos")}>
                    Ver todos
                  </Button>
                )}
              </Stack>

              <Divider sx={{ my: 1 }} />
              {isLoading ? (
                <Stack spacing={1}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" height={56} />
                  ))}
                </Stack>
              ) : profile?.recentProjects?.length ? (
                <Stack spacing={1}>
                  {profile.recentProjects!.map((p) => (
                    <Paper
                      key={p.id}
                      variant="outlined"
                      sx={{
                        p: 1.2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        bgcolor: "#fff",
                        borderRadius: 2,
                      }}
                    >
                      <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main" }}>
                        {String(p.name).slice(0, 1).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {p.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.role || "Membro"}
                        </Typography>
                      </Box>
                      {/* Se tiver rota: nav(`/projetos/${p.id}/tasks`) */}
                      <Button size="small" onClick={() => nav(`/projetos/${p.id}/tasks`)}>
                        Abrir
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum projeto listado.
                </Typography>
              )}
            </Paper>

            {/* Activity */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                border: "1px solid",
                borderColor: "divider",
                background: headerBg,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Atividade
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {isLoading ? (
                <Stack spacing={1}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" height={44} />
                  ))}
                </Stack>
              ) : profile?.recentActivity?.length ? (
                <Stack spacing={1.5}>
                  {profile.recentActivity!.map((a) => (
                    <Stack
                      key={a.id}
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                      sx={{ bgcolor: "#fff", p: 1.2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          mt: "7px",
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{a.text}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(a.when).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma atividade recente.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
