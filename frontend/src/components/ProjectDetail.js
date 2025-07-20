import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, Chip, Grid, Card, CardContent, Button } from '@mui/material';
import axios from 'axios';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/projects/${id}`).then(res => {
      setProject(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Box p={4}><Typography>Loading...</Typography></Box>;
  if (!project) return <Box p={4}><Typography>Project not found.</Typography></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, fontSize: 40, mr: 3 }}>
          {project.icon ? project.icon : project.name[0]}
        </Avatar>
        <Box>
          <Typography variant="h4">{project.name}</Typography>
          <Chip label={project.status} color={project.status === 'active' ? 'success' : 'default'} sx={{ ml: 1 }} />
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>{project.description}</Typography>
        </Box>
      </Box>
      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Members</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {project.members.map(m => (
          <Chip key={m.id} label={`User ${m.id} (${m.role})`} />
        ))}
      </Box>
      <Typography variant="h6" sx={{ mb: 1 }}>Tasks</Typography>
      <Grid container spacing={2}>
        {project.tasks.map(task => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">{task.title}</Typography>
                <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                <Chip label={task.status} size="small" sx={{ mt: 1, mr: 1 }} />
                <Chip label={task.priority} size="small" sx={{ mt: 1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
        Created at: {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
      </Typography>
    </Box>
  );
} 