import * as React from 'react';
import Box from '@mui/material/Box';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SearchTaskForm from './components/SearchTaskForm';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppContext } from '../../context/AppProvider';

export default function SearchTaskPage() {

  const {setCurrentScreen} = useAppContext();
  useEffect(() => {
    setCurrentScreen('tasks')
  }, [])

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems:'center', mt:1.0, }}>
        <Header title="Encontrar tarefas"></Header> 
        <SearchTaskForm></SearchTaskForm>
        <Footer></Footer>
    </Box>
  );
}