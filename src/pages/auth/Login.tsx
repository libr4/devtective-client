import cover from '../../assets/detective.jpg'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// SignIn.tsx
import * as React from "react";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
// import axios from "axios";
import api from '../../api/axios';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  Link,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
  CircularProgress,
  createTheme,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { GiSmokingPipe } from "react-icons/gi";
import Copyright from './components/Copyright';

/** --------------------------------
 *  Theme (module scope, no re-create)
 * --------------------------------*/
const primary = {
  main: "#00796b",
  light: "#48a999",
  dark: "#004c40",
  contrastText: "#ffffff",
} as const;

const theme = createTheme({
  palette: { primary },
});

/** --------------------------------
 *  Types
 * --------------------------------*/
interface LoginData {
  username: string;
  password: string;
}

/** --------------------------------
 *  Page
 * --------------------------------*/
  export default function SignIn() {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMsg(null);

      const form = new FormData(event.currentTarget);
      const data: LoginData = {
        username: String(form.get("username") ?? ""),
        password: String(form.get("password") ?? ""),
      };

      if (!data.username || !data.password) {
        setErrorMsg("Preencha usuário e senha.");
        return;
      }

      try {
        setIsSubmitting(true);
        await api.post("/api/v1/auth/login", data /*, { withCredentials: true } */);
        navigate("/projetos");
      } catch (err: unknown) {
        setErrorMsg("Não foi possível entrar. Verifique suas credenciais.");
        if (import.meta.env?.MODE === "development") console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    };
    const [showPassword, setShowPassword] = useState(false);
    function handleMouseDownPassword(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
      event.preventDefault();
      setShowPassword(true);
    }
    function handleClickShowPassword(): void {
      setShowPassword((show) => !show);
    }
    function handleMouseUpPassword(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
      event.preventDefault();
      // setShowPassword(false);
    }

    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            backgroundImage: `url(${cover})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            // backgroundPosition: { xs: "center", md: "left center", lg:"0% 10%" },
            backgroundPosition: { xs: "center", md: "left center", lg:"90% 85%" },
            // backgroundPosition: "left center",
            // backgroundPosition: "0% 10%",
            width: "100vw",
            height: "100vh",
          }}
        >
          <CssBaseline />

          {/* Right-anchored, vertically centered container */}
          <Container
            component="main"
            maxWidth="xs"
            role="main"
            sx={{
              ml: "auto",
              mr: { xs: 2, md: 6, lg: 25 }, // push further right responsively
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              pb: 0,
            }}
          >
            {/* Glassy card for contrast and alignment */}
            <Paper
              elevation={6}
              sx={{
                width: "100%",
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.2)",
                // backdropFilter: "blur(3px)",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Avatar sx={{ mb: 1, bgcolor: "primary.main" }} aria-hidden>
                  <GiSmokingPipe size={32} />
                </Avatar>

                <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
                  Entrar
                </Typography>

                {errorMsg && (
                  <Alert severity="error" sx={{ mt: 1, mb: 1, width: "100%" }}>
                    {errorMsg}
                  </Alert>
                )}

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  noValidate
                  sx={{ mt: 1, width: "100%" }}
                  aria-label="Formulário de login"
                >
                  <TextField
                    size="small"
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Usuário"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    variant="filled"
                    InputProps={{ disableUnderline: true }}
                    sx={{
                      "& .MuiFilledInput-root": {
                        borderRadius: 1.5,
                        boxShadow: 1,
                        bgcolor: "common.white",
                      },
                    }}
                  />

                  <TextField
                    size="small"
                    margin="normal"
                    required
                    fullWidth
                    id="password"
                    name="password"
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
    disableUnderline: true,
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label={showPassword ? 'hide the password' : 'display the password'}
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
          edge="end"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
                    autoComplete="current-password"
                    variant="filled"
                    // InputProps={{ disableUnderline: true }}
                    sx={{
                      "& .MuiFilledInput-root": {
                        borderRadius: 1.5,
                        boxShadow: 1,
                        bgcolor: "common.white",
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={22} /> : "Entrar"}
                  </Button>

                  <Grid container>
                    <Grid item xs>
                      <Link component={RouterLink} to="/forgot-password" variant="body2">
                        Esqueceu a senha?
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link component={RouterLink} to="/register" variant="body2">
                        {"CRIAR CONTA"}
                      </Link>
                    </Grid>
                  </Grid>
                </Box>

                <Copyright sx={{ mt: 3 }} />
              </Box>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }
