import Box from '@mui/material/Box';
import { useLocation, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppProvider';
import { useEffect } from 'react';
import TaskViewSecond, { Task } from '../components/TaskViewSecond';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '../api/axios';
import { CircularProgress, Typography } from '@mui/material';

export default function TaskViewPage() {

  const {currentScreen, setCurrentScreen} = useAppContext();

  useEffect(() => {
    if (currentScreen !== 'tasks')
      setCurrentScreen('tasks')
  }, [currentScreen, setCurrentScreen])

  const { projectId, taskNumber } = useParams<{ projectId: string; taskNumber: string }>();

  
  const {
    data: taskRes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['task', projectId, taskNumber],
    enabled: Boolean(projectId && taskNumber),
    queryFn: async (): Promise<Task> => {
      const { data } = await api.get<Task>(`/api/v1/projects/${projectId}/tasks/${taskNumber}`);
      return data;
    },
    // staleTime: staleTimeMs,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap',  mt:0, ml:0, }}>
        <TaskViewSecond taskData={taskRes}></TaskViewSecond>
    </Box>
  );
}
