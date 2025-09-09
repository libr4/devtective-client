import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Typography from '@mui/material/Typography';
import { FormControlLabel, createTheme } from '@mui/material';
import Header from '../components/Header';
import { ThemeProvider } from '@emotion/react';
import { Copyright } from './Login';
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
    <Box sx={{ display: 'flex', flexWrap: 'wrap',  mt:10, ml:2, }}>
        <Header validation={validation} title="Novo Projeto"></Header> 
        <NewProjectForm setValidation={setValidation}></NewProjectForm>
        {/* <Copyright></Copyright> */}
        <Footer></Footer>
    </Box>
  );
}