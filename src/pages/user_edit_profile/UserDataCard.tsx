import { Avatar, Box, Button, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppProvider";

export default function UserDataCard({rowSx, setMsg}) {
  const { currentUser } = useAppContext();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [position, setPosition] = useState(currentUser?.position ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
//   const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const qc = useQueryClient();

  useEffect(() => {
      setName(currentUser?.name ?? "");
      setEmail(currentUser?.email ?? "");
      setPosition(currentUser?.position ?? "");
    }, [currentUser]);
  
    useEffect(() => {
      if (!avatarFile) {
        setAvatarPreview(null);
        return;
      }
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    }, [avatarFile]);

    type UserPayload = {
      name?: string;
      position?: string;
      email?: string;
    };

    const roles = useMemo(
    () => [
      "Product Owner",
      "Scrum Master",
      "Developer",
      "QA",
      "Designer",
      "DevOps",
      "Data",
      "Stakeholder",
    ],
    []
  );

  // ----- Mutations -----
  const updateProfile = useMutation({
    mutationKey:['user-profile'],
    mutationFn: async (payload: UserPayload) => {
      // Adjust endpoint/body to your API contract
      const res = await axios.patch("/api/v1/users/me", payload, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["current-user"] });
      setMsg({ type: "success", text: "Perfil atualizado com sucesso." });
    },
    onError: (e: any) => {
      setMsg({
        type: "error",
        text: e?.response?.data?.message ?? "Não foi possível atualizar o perfil.",
      });
    },
  });

    const uploadAvatar = useMutation({
        mutationKey:['user-avatar'],
        mutationFn: async (file: File) => {
          const fd = new FormData();
          fd.append("avatar", file);
          const res = await axios.post("/api/v1/users/me/avatar", fd, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          });
          return res.data;
        },
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["current-user"] });
          setMsg({ type: "success", text: "Foto atualizada com sucesso." });
          setAvatarFile(null);
          setAvatarPreview(null);
        },
        onError: (e: any) => {
          setMsg({
            type: "error",
            text: e?.response?.data?.message ?? "Falha ao enviar a foto.",
          });
        },
      });

    // ----- Handlers -----
    const handleSaveProfile = () => {
      const payload: UserPayload = {};
      if (name !== currentUser?.name) payload.name = name.trim();
      if (email !== currentUser?.email) payload.email = email.trim();
      if (position !== (currentUser?.position ?? "")) payload.position = position;
      if (!Object.keys(payload).length) {
        setMsg({ type: "error", text: "Nenhuma alteração para salvar." });
        return;
      }
      updateProfile.mutate(payload);
    };
  
    const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      if (f) setAvatarFile(f);
    };
  
    const handleUploadAvatar = () => {
      if (!avatarFile) {
        setMsg({ type: "error", text: "Escolha um arquivo de imagem primeiro." });
        return;
      }
      uploadAvatar.mutate(avatarFile);
    };

    return (
    <Paper
          elevation={3}
          sx={{
            p: 0,
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, hsl(168, 45%, 97%), hsl(165, 50%, 95%))",
          }}
        >
          {/* Avatar + identity */}
          <Box sx={rowSx()}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 130 }}>
              <Typography sx={{ fontWeight: 600, minWidth: 130 }}>Foto:</Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Avatar
                src={avatarPreview ?? currentUser?.avatarUrl ?? undefined}
                alt={currentUser?.name ?? "avatar"}
                sx={{ width: 72, height: 72, border: "2px solid rgba(0,0,0,0.08)" }}
              >
                {(currentUser?.name ?? "?").slice(0, 1).toUpperCase()}
              </Avatar>

              <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="outlined" component="label">
                  Escolher imagem
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarPick}
                  />
                </Button>
                <Tooltip title="PNG ou JPG recomendado">
                  <Typography variant="caption" color="text.secondary">
                    Tamanho ideal ~512×512
                  </Typography>
                </Tooltip>
              </Stack>

              <Box sx={{ flex: 1 }} />
              <Button
                variant="contained"
                onClick={handleUploadAvatar}
                disabled={!avatarFile}
              >
                Enviar foto
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Name / Position */}
          <Box sx={rowSx()}>
            <TextField
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="position-label">Posição</InputLabel>
              <Select
                labelId="position-label"
                label="Posição"
                value={position}
                onChange={(e) => setPosition(e.target.value as string)}
              >
                {roles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Email (username locked) */}
          <Box sx={rowSx()}>
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="Username"
              value={currentUser?.username ?? ""}
              InputProps={{ readOnly: true }}
              helperText="Nome de usuário não pode ser alterado."
              fullWidth
            />
          </Box>

          {/* Save profile */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 2, pb: 3, pt: 1 }}>
            <Button variant="contained" onClick={handleSaveProfile}>
              Salvar alterações
            </Button>
          </Box>
        </Paper>
)}