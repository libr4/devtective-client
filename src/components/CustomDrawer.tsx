import { useState } from 'react'
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import AddIcon from '@mui/icons-material/Add';
import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
// import '../App.css'
import React from 'react'
import { ThemeProvider } from '@emotion/react';
import { Typography, createTheme } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppProvider';
import { GiSettingsKnobs } from 'react-icons/gi';


export default function CustomDrawer() {
  const {projectId} = useParams();
  const {currentScreen, cardClicked} = useAppContext();

  const tasksMenu = [
    {
      label:'Nova Tarefa', 
      path:`${projectId}/nova_tarefa`, 
      icon:<CreateIcon color='primary' />
    }, 
    {
      label:'Buscar Tarefas', 
      path:`/${projectId}/tasks`, 
      icon:<SearchIcon color='primary' /> 
    }, 
    {
      label:'Filtros', 
      path:'/', 
      icon:<InboxIcon color='primary' />
    }, 
    {
      label:'Iniciar chat', 
      path:'/', 
      icon:<MailIcon color='primary' />
    }
  ]

  const projectsMenu = [
    {label:'Novo Projeto', path:`novo-projeto`, disabled:false, icon:<AddIcon></AddIcon>}, 
    {label:'Alterar', path:cardClicked ? `/${cardClicked}/alterar`: '#', disabled: cardClicked == '', icon:<CreateIcon></CreateIcon>}, 
    {label:'Duplicar', path:cardClicked ? `/${cardClicked}/duplicar`: '#', disabled: cardClicked == '', icon: <InboxIcon></InboxIcon>}, 
    {label:'Deletar', path:cardClicked ? `/${cardClicked}/deletar`: '#', disabled: cardClicked == '', icon:<DeleteIcon></DeleteIcon>}
  ]
  
  const menus = {
    projects:projectsMenu,
    tasks:tasksMenu
  }
    const color = '#00796b';
    const icons = [
                    <CreateIcon color='primary' />, 
                    <SearchIcon color='primary'/>, 
                    <InboxIcon color='primary'/>, 
                    <MailIcon color='primary'/>
                  ];

    const secondMenu = [
      { 
        label: "Novo Grupo",
        icon: <AddIcon></AddIcon>
      }, 
      {
        label: "Modo Jogo",
        icon: <VideogameAssetIcon></VideogameAssetIcon>
      }, 
      {
        label: "Configurações",
        icon:<GiSettingsKnobs />
      },]

  const drawerWidth = 160;

  const primary = {
    main: '#00796b',           // Main teal color
    light: '#48a999',          // Lighter shade of the main color
    dark: '#004c40',           // Darker shade of the main color
    contrastText: '#ffffff'    // White text contrasts well with the main color
};

const theme = createTheme({
  palette: {
    primary,
    // secondary: purple,
  },
});


  return (
    <>
    <ThemeProvider theme={theme}>
      <Drawer
        
        sx={{
          // width: drawerWidth,
          // minWidth:'50px',
          width: {
            sm:'50px',
            md:drawerWidth,
            xs:'50px',
          },
          // flexShrink: 0,
          '& .MuiDrawer-paper': {
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
          {(menus[currentScreen]).map((item, index) => (
                <Link 
                style={{
                  display:'inline',
                  all:'unset',
                }}
                 to={item.path}>
            <ListItem key={item.label} disablePadding>
              <ListItemButton disabled={item?.disabled}>
                <ListItemIcon sx={{minWidth:'40px'}}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText sx={{display:{sm:'none', md:'block', xs:'none'}}} primary={item.label} />
              </ListItemButton>
            </ListItem>
                </Link>
          ))}
        </List>
        <Divider />
        <List>
          {secondMenu.map((item, index) => (
            <ListItem key={item.label} disablePadding>
              {/* <ListItemButton> */}
              <ListItemButton>
                <ListItemIcon sx={{minWidth:'40px'}}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText sx={{display:{sm:'none', md:'block', xs:'none'}}} primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </ThemeProvider>
    </>
)}