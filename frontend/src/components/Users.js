import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [role, setRole] = useState('user');

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => {
    const res = await axios.get('/api/users');
    setUsers(res.data);
  };

  const handleOpen = (user) => {
    setEditing(user);
    setRole(user.role);
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditing(null); };

  const handleSave = async () => {
    await axios.put(`/api/users/${editing.id}`, { role });
    handleClose();
    fetchUsers();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Users</Typography>
      <Grid container spacing={3}>
        {users.map(user => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{user.name[0]}</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                <Chip label={user.role} size="small" color={user.role === 'admin' ? 'error' : 'primary'} sx={{ mt: 1 }} />
              </Box>
              <Button startIcon={<EditIcon />} onClick={() => handleOpen(user)} variant="outlined" sx={{ ml: 2 }}>Edit</Button>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Role"
            value={role}
            onChange={e => setRole(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 