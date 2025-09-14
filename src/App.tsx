import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
// import './App.css'
import React, { useEffect } from 'react'
import axios from 'axios'
import CustomAppBar from './components/CustomAppBar';
import CustomDrawer from './components/CustomDrawer';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Footer from './components/Footer';
import AppProvider, { useAppContext } from './context/AppProvider';
import { useQuery } from '@tanstack/react-query';
import { CircularProgress, Toolbar } from '@mui/material';
import CustomAppBarSecond from './components/CustomAppBarSecond';
import CustomDrawerSecond from './components/CustomDrawerSecond';


export default function App() {
  const location = useLocation();
  const {currentUser, setCurrentUser} = useAppContext();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await axios.get("/api/v1/users/me", { withCredentials: true });
      return res.data ?? null; 
    },
    staleTime: 0,
    refetchOnMount: "always",        
    refetchOnWindowFocus: false,     
    retry: (n, err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) return false;
      return n < 1;
    },
  });

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user, currentUser])

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <>
      <CssBaseline />
        <CustomAppBarSecond />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <CustomDrawerSecond />
        <Box component="main" sx={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
          <Box sx={{ p: 0, flex: 1,  }}>
            <Outlet />
          </Box>
        </Box>
        <Footer />
      </Box>
    </>
  );
}
