import Box from '@mui/material/Box';
import { Button, CircularProgress, FormControlLabel, MenuItem, Select, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { useEffect, useState } from 'react';
import "dayjs/locale/pt-br";
import axios from 'axios';
import ProjectCard from '../components/project_card/ProjectCard';
import Header from '../components/Header';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../context/AppProvider';

const CARD_ID_PREFIX = 'card_'

export default function ProjectPage() {
  
  // const [showPassword, setShowPassword] = React.useState(false);


  const {sayHello, setProjects, setCurrentScreen, setCurrentUser, 
    cardClicked, setCardClicked,
    clickedElement, setClickedElement
  
  } = useAppContext();

  useEffect(() => {
    setCurrentScreen('projects')
  }, [])


  // const handleClickShowPassword = () => setShowPassword((show) => !show);

  // const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   event.preventDefault();
  // };

  const LABEL_WIDTH = 120;
  const LABEL_WIDTH_2 = 90;

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

  const projectQuery = useQuery({
    queryKey:['all_projects'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/projects')
      return response.data;
    }
  })

  const currentUserQuery = useQuery({
    queryKey:['current-user'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/users/current-user')
      setCurrentUser(response.data)
      
      return response.data;
    }
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const el = clickedElement?.current;
      if (el && !el.contains(event.target as Node)) {
        setClickedElement(null);
        setCardClicked('');
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [clickedElement, setCardClicked, setClickedElement]);

  useEffect(() => {
    if(!projectQuery.isLoading) {
      setProjects(projectQuery?.data)
    }
  }, [projectQuery.isLoading])

  if (projectQuery.isLoading) return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap',  mt:0, ml:0 }}>
      <Box sx={{display: 'flex', flexWrap: 'wrap',  mt:0, ml:0 }}>
        <CircularProgress></CircularProgress>
      </Box>
    </Box>
  )

  return (
  <ThemeProvider theme={theme}>
    <Box sx={{ display: 'flex', flexWrap: 'wrap',  mt:1, ml:1 }}>
    <Header title="Projetos"></Header>
    <Box 
      id="form_wrapper"
      sx={{ 
        overflow:'auto',
        // background:'#C8C8C8',
        display: 'flex',
        alignItems:'center',
        flexWrap:'wrap',
        pl:1,
        width:'100vw',
        gap:'10px',
        '& > *': {
          flex: '0 0 calc(25% - 10px)',   // two per row
          maxWidth: 'calc(25% - 10px)',
        },
      }}
    >
      {projectQuery.data.map((item, index) => {
        return <ProjectCard id={CARD_ID_PREFIX + item._id} key={item._id} projectKey={item._id} project={item} title={item.name.toUpperCase()} description={item.description}></ProjectCard>
      })}
    </Box>
    </Box>
    </ThemeProvider>
  );
}