import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
// import { AppBar, Toolbar, Typography } from '@material-ui/material';

const footer = {
    top: 'auto',
    bottom: 0,
    textAlign: 'center',
    width: '100%',
    // height:'20px',
    height:'4vh',
    background:'#00796b',
    // background:'#ffffff',
    display:'flex',
    alignItems:'center',
    flexDirection:'row',
    justifyContent:'center',
    zIndex: (theme:any) => theme.zIndex.drawer + 1,
}

const Footer = () => {
//   const classes = useStyles();

  return (
    <AppBar elevation={0} 
    
      // position="fixed" 
      sx={footer}>
    {/* <Box sx={{
        display:'flex',
        // alignContent:'center',
        justifyContent:'center'
      }}> */}
      <Toolbar sx={{
        display:'flex',
        alignItems:'center',
        alignContent:'center'
      }}>
        <Typography 
            variant="body2" 
            sx={{
            color:'##ffffff',
      }}>
          © {new Date().getFullYear()} Devtective. All rights reserved.
        </Typography>
      </Toolbar>
      {/* </Box> */}
    </AppBar>
  );
};

export default Footer;