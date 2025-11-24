import { Box } from '@mui/material'
import cover from '../assets/not_found.png'
import React from 'react'

export default function ErrorPage() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${cover})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 9999, // if needed
      }}
    />
  );
}