import Box from '@mui/material/Box';
import { useLocation, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppProvider';
import { useEffect } from 'react';
import TaskViewSecond from '../components/TaskViewSecond';

export default function TaskViewPage() {

  const {currentScreen, setCurrentScreen} = useAppContext();

  useEffect(() => {
    if (currentScreen !== 'tasks')
      setCurrentScreen('tasks')
  }, [currentScreen])

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap',  mt:0, ml:0, }}>
        <TaskViewSecond></TaskViewSecond>
    </Box>
  );
}
