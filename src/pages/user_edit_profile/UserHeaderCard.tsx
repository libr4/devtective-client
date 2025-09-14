import { Paper, Typography } from "@mui/material";

export default function UserHeaderCard({rowSx, setMsg}) {
    return (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 2,
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, hsl(168, 45%, 97%), hsl(165, 50%, 95%))",
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Meu Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Atualize suas informações, altere sua senha, envie uma foto e gerencie sua conta.
          </Typography>
        </Paper>
    )
}