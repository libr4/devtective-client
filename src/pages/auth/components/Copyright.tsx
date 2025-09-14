import { Link, Typography } from "@mui/material";

export default function Copyright(props: React.ComponentProps<typeof Typography>) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
      sx={{ ...(props.sx ?? {}) }}
    >
      {"Copyright © "}
      <Link
        color="inherit"
        href="https://devtective.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Devtective
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}