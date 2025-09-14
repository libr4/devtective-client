import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  Alert,
  createTheme,
  Tooltip,
} from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import { useAppContext } from "../../context/AppProvider";
import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import UserDataCard from "./UserDataCard";
import ChangePasswordCard from "./ChangePasswordCard";
import UserHeaderCard from "./UserHeaderCard";
import DeleteUserCard from "./DeleteUserCard";

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
    error: { main: "#d32f2f" },
    warning: { main: "#ed6c02" },
  },
  shape: { borderRadius: 16 },
});

const rowSx = (minHeight = 56) => ({
  display: "flex",
  gap: 2,
  alignItems: "center",
  minHeight,
  px: 3,
  py: 2,
});

export default function UserProfilePage() {
  const { currentUser } = useAppContext();
  const qc = useQueryClient();

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const postAvatarPeding = useIsMutating({mutationKey:['user-avatar']}) > 0;
  const changePasswordPending = useIsMutating({mutationKey:['change-password']}) > 0;
  const deleteUserPending = useIsMutating({mutationKey:['delete-user']}) > 0;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          maxWidth: 900,
          width: "100%",
          px: 1,
          py: 1,
        }}
      >
        <UserHeaderCard rowSx={rowSx} setMsg={setMsg} />
        {postAvatarPeding || changePasswordPending || deleteUserPending ? (
          <LinearProgress sx={{ mb: 2 }} />
        ) : null}
        {msg && (
          <Alert
            severity={msg.type}
            onClose={() => setMsg(null)}
            sx={{ mb: 2 }}
          >
            {msg.text}
          </Alert>
        )}
        <UserDataCard rowSx={rowSx} setMsg={setMsg} />
        <ChangePasswordCard rowSx={rowSx} setMsg={setMsg} />
        <DeleteUserCard rowSx={rowSx} setMsg={setMsg} />
      </Box>
    </ThemeProvider>
  );
}
