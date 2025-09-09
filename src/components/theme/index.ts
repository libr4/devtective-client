import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: { main: "#00796b", light: "#48a999", dark: "#004c40", contrastText: "#ffffff" },
    text: { primary: "#000000", secondary: "#555555" },
  },
  typography: { h5: { fontWeight: "bold" } },
});
