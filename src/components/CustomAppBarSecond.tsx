import * as React from "react";
import { useMemo } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
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
import { useAppContext } from "../context/AppProvider";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
  const {currentUser, currentProject, setCurrentProject} = useAppContext();
  // if (currentProject == null) {
  //   const {state} = useLocation();
  //   setCurrentProject(state);
  // }
  console.log("APP BAR PROJECT:", currentProject)

  // Build pages safely (avoid bad links if params are missing)
  const pages = useMemo(
    () => [
      { label: "Projetos", to: "/projetos", disabled: false },
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
      { label: (currentProject ? currentProject.name : "Escolha o projeto"), to: "/projetos", disabled: false },
      { label: (currentUser ? currentUser.username : "Loading..."), to: "/user/profile", disabled: false },
    ],
    [projectId, taskId, currentProject, currentUser]
  );

const settings = useMemo(
  () => [
    { label: "Profile", to: "/user/profile", disabled: false },
    { label: "Settings", to: "/user/settings", disabled: false },
    { label: "Dashboard", to: "/user/dashboard", disabled: false },
    { label: "Logout", to: "/user/logout", disabled: false },
  ],
  []
);

  // Menus
  const [navEl, setNavEl] = React.useState<HTMLElement | null>(null);
  const [userEl, setUserEl] = React.useState<HTMLElement | null>(null);

  const openNav = (e: React.MouseEvent<HTMLElement>) => setNavEl(e.currentTarget);
  const closeNav = () => setNavEl(null);

  const openUser = (e: React.MouseEvent<HTMLElement>) => setUserEl(e.currentTarget);
  const closeUser = () => setUserEl(null);

  // (Optional) hook up logout here later
  const onSettingClick = () => {
    closeUser();
    if (false) {
      // TODO: call logout flow
    }
  };

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      
      const res = await axios.get(`/api/v1/projects/${projectId}`, { withCredentials: true });
      console.log("PROJECT QUERY DONE IN APP BAR: ", res.data)
      return res.data;
    },
    retry: 0,
    enabled:!currentProject,
  });

  React.useEffect(() => {
    if (projectQuery.data) {
      console.log("ASSIGNED CURRENT PROJECT APP BAR")
      setCurrentProject(projectQuery.data);
    }
  }, [projectQuery.data]);

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
                {pages.map((p, i) => (
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
              {pages.map((p, i) => (
                <Button
                  key={p.label}
                  component={p.disabled ? "button" : RouterLink}
                  to={p.disabled ? undefined : p.to}
                  onClick={p.disabled ? undefined : closeNav}
                  disabled={p.disabled}
                  // sx={{ my: 1, mr: 1, color: "white" }}
                    sx={{
                      my: 1, mr: 1, color: "white" ,
                      ml:i === 4 ? "auto": ""
                    }}
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
                  <MenuItem
                    key={s.label}
                    onClick={() => onSettingClick()}
                    disabled={s.disabled}
                    component={RouterLink}
                    to={s.to}
                  >
                    <Typography textAlign="center">{s.label}</Typography>
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
