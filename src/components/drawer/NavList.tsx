import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";

export default function NavList({
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
