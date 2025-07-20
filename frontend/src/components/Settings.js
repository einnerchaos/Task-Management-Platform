import React from 'react';
import { Box, Typography, Avatar, Paper, Divider, Switch, FormControlLabel, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>Settings</Typography>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontWeight: 700 }}>{user?.name ? user.name[0] : 'U'}</Avatar>
          <Box>
            <Typography variant="h6">{user?.name || 'Demo User'}</Typography>
            <Typography color="text.secondary">{user?.email || 'demo@demo.com'}</Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Theme</Typography>
        <FormControlLabel control={<Switch defaultChecked />} label="Dark Mode (coming soon)" disabled />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Notifications</Typography>
        <FormControlLabel control={<Switch />} label="Email notifications (coming soon)" disabled />
        <FormControlLabel control={<Switch />} label="Push notifications (coming soon)" disabled />
        <Divider sx={{ my: 2 }} />
        <Button variant="contained" color="secondary" disabled>Change Password (coming soon)</Button>
      </Paper>
    </Box>
  );
} 