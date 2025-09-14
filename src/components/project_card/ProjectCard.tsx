import React, { useState } from 'react';
import { Card, CardActionArea, CardMedia, CardContent, Typography, ThemeProvider, createTheme, Box, CardActions, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppProvider';
import { useRef } from 'react';
import styles from './styles/ProjectCard.module.css';
import {theme} from '../theme'
// import cover from '../assets/detective.jpg'

// const theme = createTheme({
//   palette: {
//     primary: { main: '#00796b', light: '#48a999', dark: '#004c40', contrastText: '#ffffff' },
//     text: { primary: '#000000', secondary: '#555555' },
//   },
//   typography: { h5: { fontWeight: 'bold' } },
// });

function getMemberNames(project: { memberDetails?: { name: string }[] }) {
  return (project.memberDetails ?? []).map(m => m.name);
}

type StyledCardProps = {
  id: string;
  title: string;
  description: string;
  project: { id: string; memberDetails?: { name: string }[] };
  projectKey: string;
};

function ProjectCard({ id, title, description, project, projectKey }: StyledCardProps) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const { cardClicked, setCardClicked, setClickedElement, setCurrentProject } = useAppContext();
  const isCardClicked = cardClicked === projectKey;
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isCardClicked) {
      e.preventDefault();            
      setCardClicked(projectKey);
      setClickedElement(cardRef);
      setCurrentProject(project);
      return;
    }
      navigate(`/${project.id}/tasks`, { state: { project } });
  };

  const hoverSx = isCardClicked
    ? {} 
    : {
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
        },
      };

  return (
    <ThemeProvider theme={theme}>
      <Card
        id={id}
        ref={cardRef}
        component={Link}
        state={{project}}
        // to={isCardClicked ? `/${cardClicked}/tasks` : '#'}
        onClick={handleCardClick}
        role="button"
        sx={{
          textDecoration: 'none',
          outline: 'none',
          maxWidth: 'none',
          mx: { xs: 0, sm: 0, md: 1 },
          mt: 2,
          mb: 2,
          borderRadius: 2,
          width: '100px',
          minWidth: 0,
          transform: (isCardClicked) ? 'scale(1.09)' : undefined,
          boxShadow: (isCardClicked) ? '0px 0px 1px 3px #00796b':undefined,
          transition: 'transform 0.3s, box-shadow 0.4s',
          height: '250px',
          // transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          willChange: 'transform',
          border: '1px solid rgba(0,0,0,0.06)',
          background: '#fff',
          ...hoverSx,
          '&:focus, &:focus-visible': { outline: 'none' },
        }}
      >
      
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              width: '100%',
              background: '#004c40',
              p: 2,
              borderTopLeftRadius: 1,
              borderTopRightRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography gutterBottom variant="h5" component="div" sx={{ color: 'white' }}>
              {title}
            </Typography>

            <IconButton
              onClick={(e) => {
                e.stopPropagation(); // don’t trigger card click
                navigate(`/${project.id}/alterar`);
              }}
              size="small"
              sx={{ color: 'white', '&:hover': { opacity: 0.9 } }}
              aria-label="Editar projeto"
            >
              <EditIcon />
            </IconButton>
          </Box>

          {/* Body (same placement) */}
          <Box sx={{ p: 2 }}>
            <Typography color="text.secondary" sx={{ width: '100%', mb: 0.5 }}>
              {getMemberNames(project).join(', ')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ wordWrap: 'break-word' }}>
              {description}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}

export default ProjectCard;
