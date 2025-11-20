import * as React from "react";
import {
  Avatar,
  Box,
  Chip,
  Container,
  Divider,
  IconButton,
  Link,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import api from '../api/axios';
import { Project, ProjectMember } from "./common/types";

// -------------------- Types --------------------


// -------------------- Helpers --------------------
function formatDate(dateIso?: string | null) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  return d.toLocaleDateString("pt-BR", { year: "numeric", month: "short", day: "2-digit" });
}

const statusChipColor: Record<ProjectMember["invitationStatus"], "default" | "success" | "warning" | "error" | "info"> = {
  INVITED: "info",
  PENDING: "warning",
  ACCEPTED: "success",
  DECLINED: "error",
  REMOVED: "default",
};

// -------------------- Members Tab --------------------
function MembersTab({ projectId, linkCode }: { projectId: string, linkCode:string }) {
  const membersQuery = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      const res = await api.get<ProjectMember[]>(`/api/v1/projects/${projectId}/members`, {
        withCredentials: true,
      });
      return res.data;
    },
  });

  const projectFallback = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await api.get<Project>(`/api/v1/projects/${projectId}`, { withCredentials: true });
      return res.data;
    },
  });

  const data = membersQuery.data ?? projectFallback.data?.members ?? [];
  const loading = membersQuery.isLoading && !projectFallback.data;
  const error = membersQuery.isError && !projectFallback.data;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          {loading ? <Skeleton width={140} /> : `${data.length} membro(s)`}
        </Typography>
        <InviteLinkButton linkCode={linkCode} />
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Não foi possível carregar os membros por um endpoint dedicado. Mostrando dados do projeto (se disponíveis).
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell width={56}></TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Cargo no projeto</TableCell>
              <TableCell>Status do convite</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="circular" width={36} height={36} /></TableCell>
                  <TableCell><Skeleton width={240} /></TableCell>
                  <TableCell><Skeleton width={180} /></TableCell>
                  <TableCell><Skeleton width={120} /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
                    Nenhum membro por aqui.
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((m) => (
                <TableRow key={m.userPublicId} hover>
                  <TableCell>
                    <Avatar src={m.avatarUrl} alt={m.displayName} sx={{ width: 36, height: 36 }}>
                      {m.displayName?.[0]}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Stack>
                      <Typography variant="body1" fontWeight={600}>
                        {m.displayName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{m.username ?? "usuario"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={m.position ?? "—"} sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={statusChipColor[m.invitationStatus]}
                      label={m.invitationStatus}
                      sx={{ fontWeight: 700, letterSpacing: 0.3 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

function InviteLinkButton({linkCode}:{linkCode:string}) {
  const [copied, setCopied] = React.useState<null | string>(null);
  const handleCopy = async () => {
    const link = `${window.location.origin}/invite/${linkCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(link);
    setTimeout(() => setCopied(null), 1800);
  };
  return (
    <Tooltip title={copied ? "Copiado!" : "Copiar link de convite (em breve)"} arrow>
      <span>
        <Button onClick={handleCopy} size="small" startIcon={<ContentCopyIcon />}>
          Copiar convite
        </Button>
      </span>
    </Tooltip>
  );
}

// -------------------- Project Page --------------------
export default function ProjectViewScreen() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<"overview" | "members">("members");

  const projectQuery = useQuery<Project>({
    queryKey: ["project", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const res = await api.get<Project>(`/api/v1/projects/${projectId}` , { withCredentials: true });
      return res.data;
    },
  });

  const p = projectQuery.data;
  console.log("PROJECT", p);
  const linkCode = p?.publicId;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        {/* Header */}
        <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => navigate(-1)} aria-label="Voltar">
              <ArrowBackIcon />
            </IconButton>
            <Stack spacing={0.5} flex={1} minWidth={0}>
              <Typography variant="h5" fontWeight={700} noWrap>
                {p ? p.name : <Skeleton width={240} />}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                {p ? (
                  <>
                    {p.workspace?.name && (
                      <Chip size="small" label={`Workspace: ${p.workspace.name}`} />
                    )}
                    <Chip
                      size="small"
                      icon={<InfoOutlinedIcon fontSize="small" />}
                      label={`Início: ${formatDate(p.startDate)} • Fim: ${formatDate(p.endDate)}`}
                    />
                  </>
                ) : (
                  <Skeleton width={300} />
                )}
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {/* Tabs */}
        <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Abas do projeto"
            sx={{ px: 1, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab value="overview" icon={<InfoOutlinedIcon />} iconPosition="start" label="Visão geral" />
            <Tab value="members" icon={<PeopleOutlineIcon />} iconPosition="start" label="Membros" />
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {tab === "overview" && (
              <Stack spacing={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Descrição
                </Typography>
                <Typography>
                  {p ? p.description || "Sem descrição." : <Skeleton width={480} />}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">
                  Liderança
                </Typography>
                {p ? (
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    {(p.leaders ?? []).length === 0 && (
                      <Typography color="text.secondary">—</Typography>
                    )}
                    {(p.leaders ?? []).map((l) => (
                      <Chip
                        key={l.publicId}
                        avatar={<Avatar src={l.avatarUrl}>{l.displayName?.[0]}</Avatar>}
                        label={`${l.displayName}${l.username ? ` (@${l.username})` : ""}`}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Skeleton width={320} />
                )}
              </Stack>
            )}

            {tab === "members" && projectId && <MembersTab projectId={projectId} linkCode={linkCode as string} />}
          </Box>
        </Paper>

        <Box textAlign="center" color="text.secondary">
          <Typography variant="caption">
            ID do projeto: {projectId}
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}
