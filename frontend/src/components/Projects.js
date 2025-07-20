import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Avatar, Chip, IconButton, InputAdornment, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const colorPalette = [
  '#7B1FA2', '#1976D2', '#388E3C', '#FBC02D', '#E64A19', '#00897B', '#C2185B', '#512DA8', '#0288D1', '#388E3C', '#FFA000', '#D32F2F', '#455A64', '#F57C00', '#0097A7', '#689F38', '#F06292', '#5E35B1', '#43A047', '#FF7043'
];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);
  const fetchProjects = async () => {
    const res = await axios.get('/api/projects');
    setProjects(res.data);
  };

  const handleOpen = (project = null) => {
    setEditing(project);
    setForm(project ? { name: project.name, description: project.description } : { name: '', description: '' });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditing(null); };

  const handleSave = async () => {
    // Only allow creating new projects (POST)
    await axios.post('/api/projects', form);
    handleClose();
    fetchProjects();
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      await axios.delete(`/api/projects/${id}`);
      fetchProjects();
    }
  };

  const filtered = projects.filter(p =>
    (statusFilter === 'all' || p.status === statusFilter) &&
    (ownerFilter === 'all' || p.owner_id === Number(ownerFilter)) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add Project</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          size="small"
          sx={{ width: 140 }}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="planning">Planning</MenuItem>
        </TextField>
        <TextField
          select
          label="Owner"
          value={ownerFilter}
          onChange={e => setOwnerFilter(e.target.value)}
          size="small"
          sx={{ width: 140 }}
        >
          <MenuItem value="all">All Owners</MenuItem>
          {[1,2,3,4,5].map(uid => (
            <MenuItem key={uid} value={uid}>User {uid}</MenuItem>
          ))}
        </TextField>
        <TextField
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ width: 300 }}
        />
      </Box>
      <Grid container spacing={3}>
        {filtered.map((project, idx) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card sx={{
              p: 2,
              position: 'relative',
              cursor: 'pointer',
              boxShadow: 3,
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.03)',
                boxShadow: 8,
              },
              borderRadius: 3,
              background: '#fff',
            }} onClick={() => navigate(`/projects/${project.id}`)}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: colorPalette[idx % colorPalette.length], mr: 2, fontSize: 28 }}>
                  {project.icon ? project.icon : project.name[0]}
                </Avatar>
                <Typography variant="h6">{project.name}</Typography>
                <Chip label={project.status} size="small" color={project.status === 'active' ? 'success' : 'default'} sx={{ ml: 2 }} />
                <Chip label={`${project.members ? project.members.length : 5} members`} size="small" sx={{ ml: 2, bgcolor: '#eee', color: '#333' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{project.description}</Typography>
              <Typography variant="caption" color="text.secondary">{project.task_count} tasks</Typography>
              <Box sx={{ position: 'absolute', top: 8, right: 8 }} onClick={e => e.stopPropagation()}>
                <IconButton size="small" onClick={() => handleDelete(project.id)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Project Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 