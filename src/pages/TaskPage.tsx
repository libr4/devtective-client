import * as React from 'react';
import Box from '@mui/material/Box';
import { createTheme } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NewTask() {

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };


  const primary = {
    main: '#9b111e',
    // light: '#42a5f5',
    // dark: '#1565c0',
    // contrastText: '#fff',
  };

  const theme = createTheme({
    palette: {
      primary,
      // secondary: purple,
    },
  });

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap',  mt:10, ml:2, }}>
        <Header title="Tarefas"></Header> 
        <Footer></Footer>
    </Box>
  );
}