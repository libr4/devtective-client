import * as React from "react";
import { Box, Container, Stack, Typography, Alert } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

type HeaderProps = {
  title: React.ReactNode;
  /** Optional content for the right side (buttons, chips, etc.) */
  rightSlot?: React.ReactNode;
  /** Optional validation/error message shown below the header row */
  validation?: React.ReactNode;
  /** Allow consumers to override max width */
  maxWidth?: false | "xs" | "sm" | "md" | "lg" | "xl";
  /** Pass-through styling */
  sx?: SxProps<Theme>;
  className?: string;
};

export default function Header({
  title,
  rightSlot,
  validation,
  maxWidth = "lg",
  sx,
  className,
}: HeaderProps) {
  return (
    <Box
      component="header"
      role="banner"
      sx={{
        position: "relative",      // make z-index apply
        zIndex: 0,                 // keep it low
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        ...sx,
        pointerEvents: "none",     // <-- header wrapper won't eat clicks
      }}
      className={className}
    >
      <Container maxWidth={maxWidth}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          py={{ xs: 1.5, md: 2 }}
          spacing={2}
          sx={{ pointerEvents: "auto" }}   
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            {title}
          </Typography>

          {rightSlot ?? null}
        </Stack>

        {validation ? (
          <Alert severity="error" sx={{ mt: 1, pointerEvents: "auto" }}>
            {validation}
          </Alert>
        ) : null}
      </Container>
    </Box>
  );
}

