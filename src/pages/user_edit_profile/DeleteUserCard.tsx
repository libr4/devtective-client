import { Avatar, Box, Button, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppProvider";

export default function DeleteUserCard({rowSx, setMsg}) {

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const deleteAccount = useMutation({
    mutationKey:['delete-user'],
    mutationFn: async () => {
      // Consider soft-delete or a confirmation flow in your app
      const res = await axios.delete("/api/v1/users/me", { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      // You may want to redirect to /login after server clears session
      setMsg({ type: "success", text: "Conta excluída. Até breve!" });
    },
    onError: (e: any) => {
      setMsg({
        type: "error",
        text: e?.response?.data?.message ?? "Falha ao excluir a conta.",
      });
    },
  });

  const canDelete = deleteConfirm.trim().toUpperCase() === "DELETE";

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
            <Typography variant="h6" fontWeight={700} color="error.main">
              Zona de perigo
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <Box sx={rowSx()}>
            <Typography sx={{ minWidth: 130, fontWeight: 600 }}>
              Excluir conta:
            </Typography>
            <TextField
              fullWidth
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder='Digite "DELETE" para confirmar'
            />
            <Button
              variant="contained"
              color="error"
              disabled={!canDelete}
              onClick={() => deleteAccount.mutate()}
            >
              Excluir conta
            </Button>
          </Box>
        </Paper>
)}