import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const InvitePage = () => {
  const queryClient = useQueryClient();
  const {inviteId} = useParams();
  const navigate = useNavigate();

  // Mutation for accepting invite
  const acceptInviteMutation = useMutation({
    mutationFn: async () => {
      return axios.post(`/api/v1/invite/${inviteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project', inviteId]);
      navigate('/projetos');
    },
    onError: (error: any) => {
      console.error(error);
      alert('Failed to accept invite.');
    },
  });

  const handleAccept = () => {
    acceptInviteMutation.mutate();
  };

  const handleReject = () => {
    alert('Invite rejected.');
    // You could also send a reject request here if needed
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      p={2}
    >
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Você foi convidado para um projeto!
        </Typography>
        <Typography variant="body1" mb={3}>
          Aceitar o convite permitirá que você participe do projeto.
        </Typography>
        <Box display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAccept}
            disabled={acceptInviteMutation.isPending}
          >
            ACEITAR
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleReject}>
            REJEITAR
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvitePage;

