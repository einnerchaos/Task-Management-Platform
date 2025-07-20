import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tooltip,
  Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FolderIcon from '@mui/icons-material/Folder';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import PieChartIcon from '@mui/icons-material/PieChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const statusColors = {
  completed: '#43A047',
  in_progress: '#00B8D9',
  todo: '#FFB300',
};

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tasksRes, projectsRes, usersRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/tasks'),
        axios.get('/api/projects'),
        axios.get('/api/users'),
      ]);
      setStats(statsRes.data);
      setTasks(tasksRes.data);
      setRecentTasks(tasksRes.data.slice(-5).reverse());
      setRecentProjects(projectsRes.data.slice(-3).reverse());
      setUsers(usersRes.data);
      // Activity feed: combine recent tasks/projects
      const activityFeed = [
        ...tasksRes.data.slice(-5).map(t => ({
          type: 'task',
          title: t.title,
          user: t.assignee_name,
          date: t.created_at,
          status: t.status
        })),
        ...projectsRes.data.slice(-3).map(p => ({
          type: 'project',
          title: p.name,
          user: usersRes.data.find(u => u.id === p.owner_id)?.name,
          date: p.created_at,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivity(activityFeed);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Leaderboard: users by completed tasks
  const leaderboard = users.map(u => ({
    ...u,
    completed: tasks.filter(t => t.assignee_id === u.id && t.status === 'completed').length
  })).sort((a, b) => b.completed - a.completed).slice(0, 3);

  // Pie chart data
  const statusPie = [
    { name: 'Completed', value: stats.completed_tasks || 0, color: statusColors.completed },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: statusColors.in_progress },
    { name: 'To Do', value: stats.pending_tasks || 0, color: statusColors.todo },
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* Welcome Banner */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, background: 'linear-gradient(90deg, #6C47FF 0%, #FFB300 100%)', color: '#fff', boxShadow: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Welcome back, {user?.name || 'User'}!</Typography>
        <Typography variant="subtitle1">Here’s a quick overview of your workspace. Stay productive and keep your projects on track.</Typography>
      </Paper>
      <Grid container spacing={3}>
        {/* Stats Widgets */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 2 }}>
            <FolderIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Total Projects</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.total_projects || 0}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 2 }}>
            <ListAltIcon color="secondary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Total Tasks</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.total_tasks || 0}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 2 }}>
            <AssignmentTurnedInIcon color="success" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Completed</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.completed_tasks || 0}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 2 }}>
            <TrendingUpIcon color="warning" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.pending_tasks || 0}</Typography>
            </Box>
          </Card>
        </Grid>
        {/* Pie Chart & Leaderboard */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PieChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Task Status</Typography>
            </Box>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                  {statusPie.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmojiEventsIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Top Contributors</Typography>
            </Box>
            <List>
              {leaderboard.map((u, idx) => (
                <ListItem key={u.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: ['#6C47FF', '#FFB300', '#00B8D9'][idx % 3], fontWeight: 700 }}>{u.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={u.name}
                    secondary={<span>Completed: <b>{u.completed}</b></span>}
                  />
                  <Chip label={`#${idx + 1}`} color={idx === 0 ? 'primary' : idx === 1 ? 'secondary' : 'info'} />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GroupIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Activity</Typography>
            </Box>
            <List>
              {activity.slice(0, 5).map((a, idx) => (
                <ListItem key={idx}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: a.type === 'task' ? '#6C47FF' : '#FFB300', fontWeight: 700 }}>{a.type === 'task' ? 'T' : 'P'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={a.type === 'task' ? `Task: ${a.title}` : `Project: ${a.title}`}
                    secondary={<span>{a.user && <b>{a.user}</b>} {a.status && <Chip label={a.status} size="small" sx={{ ml: 1 }} />} {a.date && format(new Date(a.date), 'yyyy-MM-dd')}</span>}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        {/* Progress & Recent Tasks/Projects */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, boxShadow: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Completion Rate</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.completion_rate ? stats.completion_rate.toFixed(1) : 0}%</Typography>
              <LinearProgress variant="determinate" value={stats.completion_rate || 0} sx={{ flex: 1, height: 10, borderRadius: 5, bgcolor: '#eee', '& .MuiLinearProgress-bar': { background: '#6C47FF' } }} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, boxShadow: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Projects</Typography>
            <List>
              {recentProjects.map(p => (
                <ListItem key={p.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#FFB300', fontWeight: 700 }}>{p.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={p.name} secondary={p.description} />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, boxShadow: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Tasks</Typography>
            <List>
              {recentTasks.map(t => (
                <ListItem key={t.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: statusColors[t.status] || '#6C47FF', fontWeight: 700 }}>{t.title[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={t.title} secondary={`Due: ${t.due_date ? format(new Date(t.due_date), 'yyyy-MM-dd') : 'N/A'}`} />
                  <Chip label={t.status} color={t.status === 'completed' ? 'success' : t.status === 'in_progress' ? 'info' : 'warning'} />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 