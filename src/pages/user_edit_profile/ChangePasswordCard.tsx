import { Avatar, Box, Button, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppProvider";

export default function ChangePasswordCard({rowSx, setMsg}) {
    const [currPwd, setCurrPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");

    const changePassword = useMutation({
        mutationKey:['change-password'],
        mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
        const res = await axios.post("/api/v1/users/change-password", payload, {
            withCredentials: true,
        });
        return res.data;
        },
        onSuccess: () => {
        setMsg({ type: "success", text: "Senha alterada com sucesso." });
        setCurrPwd("");
        setNewPwd("");
        setConfirmPwd("");
        },
        onError: (e: any) => {
        setMsg({
            type: "error",
            text: e?.response?.data?.message ?? "Não foi possível alterar a senha.",
        });
        },
    });

    const handleChangePassword = () => {
        if (!currPwd || !newPwd) {
          setMsg({ type: "error", text: "Preencha senha atual e nova senha." });
          return;
        }
        if (newPwd !== confirmPwd) {
          setMsg({ type: "error", text: "Confirmação de senha não confere." });
          return;
        }
        changePassword.mutate({ currentPassword: currPwd, newPassword: newPwd });
    };

    return (
        <Paper
            elevation={3}
            sx={{
                mt: 2,
                p: 0,
                border: "1px solid",
                borderColor: "divider",
                background:
                "linear-gradient(135deg, hsl(168, 45%, 97%), hsl(165, 50%, 95%))",
            }}
            >
            <Box sx={rowSx()}>
                <Typography variant="h6" fontWeight={700}>
                Alterar senha
                </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={rowSx()}>
                <TextField
                label="Senha atual"
                type="password"
                value={currPwd}
                onChange={(e) => setCurrPwd(e.target.value)}
                fullWidth
                />
                <TextField
                label="Nova senha"
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                fullWidth
                />
            </Box>
            <Box sx={rowSx()}>
                <TextField
                label="Confirmar nova senha"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                fullWidth
                />
                <Box sx={{ flex: 1 }} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 2, pb: 3, pt: 1 }}>
                <Button variant="contained" onClick={handleChangePassword}>
                Atualizar senha
                </Button>
            </Box>
    </Paper>
    )}