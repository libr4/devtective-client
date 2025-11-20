import * as React from 'react';
import Box from '@mui/material/Box';
import { FormControlLabel, createTheme } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';
import CollapsibleTable from '../components/CollapsibleTable';

export default function NewTask() {

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


  const [validation, setValidation] = useState('');

  

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap',  mt:10, ml:2, }}>
        <Header validation={validation} title="Nova Tarefa"></Header> 
        <CollapsibleTable></CollapsibleTable>
        <Footer></Footer>
    </Box>
  );
}