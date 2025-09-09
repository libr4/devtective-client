import * as React from "react";
import { useMemo } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Box,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { GiSmokingPipe } from "react-icons/gi";

/** -----------------------------
 *  Theme (module scope, 1-time)
 *  (Prefer putting this at app root; kept here to be self-contained)
 * ------------------------------*/
const primary = {
  main: "#00796b",
  light: "#48a999",
  dark: "#004c40",
  contrastText: "#ffffff",
};
const theme = createTheme({
  palette: { primary },
});

export default function CustomAppBarSecond() {
  const { projectId, taskId } = useParams();

  // Build pages safely (avoid bad links if params are missing)
  const pages = useMemo(
    () => [
      { label: "Tarefa", to: "/tarefa", disabled: false },
      {
        label: "Atividades",
        to:
          projectId && taskId
            ? `/${projectId}/task/${taskId}/atividades`
            : "#",
        disabled: !(projectId && taskId),
      },
      { label: "Chat", to: "#", disabled: true }, // placeholder; wire when ready
      { label: "Projetos", to: "/projetos", disabled: false },
    ],
    [projectId, taskId]
  );

  const settings = useMemo(() => ["Profile", "Account", "Dashboard", "Logout"], []);

  // Menus
  const [navEl, setNavEl] = React.useState<HTMLElement | null>(null);
  const [userEl, setUserEl] = React.useState<HTMLElement | null>(null);

  const openNav = (e: React.MouseEvent<HTMLElement>) => setNavEl(e.currentTarget);
  const closeNav = () => setNavEl(null);

  const openUser = (e: React.MouseEvent<HTMLElement>) => setUserEl(e.currentTarget);
  const closeUser = () => setUserEl(null);

  // (Optional) hook up logout here later
  const onSettingClick = (setting: string) => {
    closeUser();
    if (setting === "Logout") {
      // TODO: call your logout flow
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="sticky"
        color="primary"
        elevation={0}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Brand (desktop) */}
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
              <GiSmokingPipe size={28} />
              <Typography
                component={RouterLink}
                to="/"
                variant="h6"
                noWrap
                sx={{
                  ml: 1,
                  mr: 3,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                DEVTECTIVE
              </Typography>
            </Box>

            {/* Mobile menu button */}
            <Box sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}>
              <IconButton
                size="large"
                aria-label="open navigation menu"
                aria-controls={navEl ? "nav-menu" : undefined}
                aria-haspopup="true"
                onClick={openNav}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="nav-menu"
                anchorEl={navEl}
                open={Boolean(navEl)}
                onClose={closeNav}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{ display: { xs: "block", md: "none" } }}
                MenuListProps={{ "aria-labelledby": "nav-button" }}
              >
                {pages.map((p) => (
                  <MenuItem
                    key={p.label}
                    onClick={closeNav}
                    disabled={p.disabled}
                    component={p.disabled ? "li" : RouterLink}
                    to={p.disabled ? undefined : p.to}
                  >
                    <Typography textAlign="center">{p.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Brand (mobile) */}
            <Typography
              component={RouterLink}
              to="/"
              variant="h6"
              noWrap
              sx={{
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              DEVTECTIVE
            </Typography>

            {/* Spacer + desktop nav */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((p) => (
                <Button
                  key={p.label}
                  component={p.disabled ? "button" : RouterLink}
                  to={p.disabled ? undefined : p.to}
                  onClick={p.disabled ? undefined : closeNav}
                  disabled={p.disabled}
                  sx={{ my: 1, mr: 1, color: "white" }}
                >
                  {p.label}
                </Button>
              ))}
            </Box>

            {/* User menu */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton
                  onClick={openUser}
                  sx={{ p: 0 }}
                  aria-controls={userEl ? "user-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(userEl)}
                >
                  <Avatar alt="User avatar" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                id="user-menu"
                anchorEl={userEl}
                open={Boolean(userEl)}
                onClose={closeUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{ mt: 1 }}
              >
                {settings.map((s) => (
                  <MenuItem key={s} onClick={() => onSettingClick(s)}>
                    <Typography textAlign="center">{s}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
}
