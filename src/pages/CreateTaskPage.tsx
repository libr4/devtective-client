import * as React from 'react';
import Box from '@mui/material/Box';
import { FormControlLabel, createTheme } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewTaskForm from '../components/NewTaskForm';
import { useState } from 'react';
import CollapsibleTable from '../components/CollapsibleTable';
import NewTaskFormSecond from '../components/NewTaskFormSecond';

export default function CreateTaskPage() {

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

  const [validation, setValidation] = useState('')

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap',  }}>
        {/* <Header validation={validation} title="Nova Tarefa"></Header>  */}
        {/* <NewTaskForm setValidation={setValidation}></NewTaskForm> */}
        <NewTaskFormSecond setValidation={setValidation}></NewTaskFormSecond>
        {/* <Copyright></Copyright> */}
        <Footer></Footer>
    </Box>
  );
}