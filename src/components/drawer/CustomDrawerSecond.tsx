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
import { useAppContext } from "../../context/AppProvider"; // <-- adjust import
import NavList from "./NavList";
import { PROJECTS_MENU, TASKS_MENU } from "./menus";

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

const DRAWER_FULL = 180;   // md and up
const DRAWER_MINI = 56;    // xs/sm (icons only)

export default function CustomDrawerSecond() {
  const { projectId } = useParams();
  const { currentScreen, cardClicked } = useAppContext();

  // Guard helpers
  const hasProject = Boolean(projectId);
  const hasCard = Boolean(cardClicked);

  const menus = useMemo(
    () => ({
      projects: TASKS_MENU(hasProject, projectId as string),
      tasks: PROJECTS_MENU(hasCard, cardClicked),
    }),
    [hasProject, hasCard, projectId, cardClicked]
  );

  const secondMenu = useMemo(
    () => [
      { label: "Novo Grupo", to: "#", disabled: true, icon: <AddIcon /> },
      { label: "Modo Jogo", to: "#", disabled: true, icon: <VideogameAssetIcon /> },
      { label: "Configurações", to: "#", disabled: true, icon: <GiSettingsKnobs /> },
    ],
    []
  );

  // Fallback to tasks if currentScreen is something unexpected
  const activeMenu = (menus as Record<string, typeof menus.tasks>)[currentScreen] ?? menus.projects;

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