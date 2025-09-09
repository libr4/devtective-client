import * as React from "react";
import { useMemo } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  Drawer,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CreateIcon from "@mui/icons-material/Create";
import SearchIcon from "@mui/icons-material/Search";
import InboxIcon from "@mui/icons-material/Inbox";
import MailIcon from "@mui/icons-material/Mail";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import { GiSettingsKnobs } from "react-icons/gi";
import { useAppContext } from "../context/AppProvider"; // <-- adjust import

/** -----------------------------
 *  Theme (module scope)
 *  (Prefer a single app-level ThemeProvider)
 * ------------------------------*/
const primary = {
  main: "#00796b",
  light: "#48a999",
  dark: "#004c40",
  contrastText: "#ffffff",
};
const theme = createTheme({ palette: { primary } });

const DRAWER_FULL = 160;   // md and up
const DRAWER_MINI = 56;    // xs/sm (icons only)

export default function CustomDrawerSecond() {
  const { projectId } = useParams();
  const { currentScreen, cardClicked } = useAppContext();

  // Guard helpers
  const hasProject = Boolean(projectId);
  const hasCard = Boolean(cardClicked);

  const tasksMenu = useMemo(
    () => [
      {
        label: "Nova Tarefa",
        to: hasProject ? `/${projectId}/nova_tarefa` : "#",
        disabled: !hasProject,
        icon: <CreateIcon color="primary" />,
      },
      {
        label: "Buscar Tarefas",
        to: hasProject ? `/${projectId}/tasks` : "#",
        disabled: !hasProject,
        icon: <SearchIcon color="primary" />,
      },
      {
        label: "Filtros",
        to: "#", // TODO
        disabled: true,
        icon: <InboxIcon color="primary" />,
      },
      {
        label: "Iniciar chat",
        to: "#", // TODO
        disabled: true,
        icon: <MailIcon color="primary" />,
      },
    ],
    [hasProject, projectId]
  );

  const projectsMenu = useMemo(
    () => [
      { label: "Novo Projeto", to: "/novo-projeto", disabled: false, icon: <AddIcon /> },
      {
        label: "Alterar",
        to: hasCard ? `/${cardClicked}/alterar` : "#",
        disabled: !hasCard,
        icon: <CreateIcon />,
      },
      {
        label: "Duplicar",
        to: hasCard ? `/${cardClicked}/duplicar` : "#",
        disabled: !hasCard,
        icon: <InboxIcon />,
      },
      {
        label: "Deletar",
        to: hasCard ? `/${cardClicked}/deletar` : "#",
        disabled: !hasCard,
        icon: <DeleteIconSafe />,
      },
    ],
    [hasCard, cardClicked]
  );

  const secondMenu = useMemo(
    () => [
      { label: "Novo Grupo", to: "#", disabled: true, icon: <AddIcon /> },
      { label: "Modo Jogo", to: "#", disabled: true, icon: <VideogameAssetIcon /> },
      { label: "Configurações", to: "#", disabled: true, icon: <GiSettingsKnobs /> },
    ],
    []
  );

  const menus = useMemo(
    () => ({
      projects: projectsMenu,
      tasks: tasksMenu,
    }),
    [projectsMenu, tasksMenu]
  );

  // Fallback to tasks if currentScreen is something unexpected
  const activeMenu = (menus as Record<string, typeof tasksMenu>)[currentScreen] ?? tasksMenu;

  return (
    <ThemeProvider theme={theme}>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: { xs: DRAWER_MINI, sm: DRAWER_MINI, md: DRAWER_FULL },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: { xs: DRAWER_MINI, sm: DRAWER_MINI, md: DRAWER_FULL },
            boxSizing: "border-box",
            overflowX: "hidden",
          },
        }}
      >
        <Toolbar />
        <Divider />

        {/* Primary menu */}
        <NavList items={activeMenu} />

        <Divider />

        {/* Secondary menu */}
        <NavList items={secondMenu} />
      </Drawer>
    </ThemeProvider>
  );
}

/** Small helper to keep List markup tidy */
function NavList({
  items,
}: {
  items: Array<{ label: string; to?: string; disabled?: boolean; icon: React.ReactNode }>;
}) {
  return (
    <List>
      {items.map((item) => {
        const btnProps = item.disabled
          ? { component: "button" as const }
          : { component: RouterLink as React.ElementType, to: item.to };

        return (
          <ListItem key={item.label} disablePadding>
            <Tooltip title={item.label} placement="right" enterDelay={600}>
              <Box sx={{ width: "100%" }}>
                <ListItemButton disabled={item.disabled} {...btnProps}>
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  {/* Hide text on mini drawer (xs/sm), show from md up */}
                  <ListItemText
                    primary={item.label}
                    sx={{ display: { xs: "none", sm: "none", md: "block" } }}
                  />
                </ListItemButton>
              </Box>
            </Tooltip>
          </ListItem>
        );
      })}
    </List>
  );
}

/** Safer placeholder for delete icon so file compiles if not imported above */
function DeleteIconSafe() {
  // Prefer importing @mui/icons-material/Delete; kept inline to avoid breaking your file
  return <span style={{ width: 24, height: 24, display: "inline-block" }}>🗑️</span>;
}
