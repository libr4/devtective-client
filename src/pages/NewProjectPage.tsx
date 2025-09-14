import * as React from 'react';
import Box from '@mui/material/Box';
import { FormControlLabel, createTheme } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import NewTaskForm from '../components/NewTaskForm';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import NewProjectForm from '../components/NewProjectForm';

export default function NewTask() {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

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


  const [validation, setValidation] = useState('');

  

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap',  mt:0, ml:0, p:0 }}>
        {/* <Header validation={validation} title="Novo Projeto"></Header>  */}
        <NewProjectForm></NewProjectForm>
        {/* <Copyright></Copyright> */}
        <Footer></Footer>
    </Box>
  );
}