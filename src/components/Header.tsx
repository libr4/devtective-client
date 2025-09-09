import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Alert, FormControlLabel } from '@mui/material';
import { useLocaleText } from '@mui/x-date-pickers/internals';
import { useLocation } from 'react-router-dom';

export default function Header(props:any) {

  let {title} = props;
  const {validation} = props;
  
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems:'center', maxWidth:'75%', marginLeft:1, pl:1 }}>
        <Box 
          sx={{
            width:'100%',
            display:'flex',
            justifyContent:'space-between',
            flex:1,
          }}>
          <Typography
            variant="h6"
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              // pl:'1.0rem',
              pb:'1.0rem',
              pr:'2rem',
              // letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {title}
          </Typography>
          {validation && <Alert severity='error'>{validation}</Alert>}
        </Box> 
          
  </Box>
  );
}