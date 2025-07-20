import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider, Box, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 220;
const brand = { name: 'FlowBoard', icon: '🌀' };

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Kanban Board', icon: <ViewKanbanIcon />, path: '/kanban' },
  { text: 'Projects', icon: <AssignmentIcon />, path: '/projects' },
  { text: 'Users', icon: <GroupIcon />, path: '/users' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #232946 70%, #6C47FF 100%)',
          color: '#fff',
          borderRight: 0,
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 72 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, fontSize: 26, letterSpacing: 1 }}>
          <span style={{ fontSize: 32 }}>{brand.icon}</span>
          {brand.name}
        </Box>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
      <List sx={{ mt: 2 }}>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
            sx={{
              color: '#fff',
              borderRadius: 2,
              mx: 1,
              mb: 1,
              position: 'relative',
              transition: 'background 0.2s, box-shadow 0.2s',
              '&.Mui-selected': {
                background: 'rgba(255,255,255,0.10)',
                fontWeight: 700,
                boxShadow: '0 2px 12px 0 rgba(108,71,255,0.12)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 4,
                  borderRadius: 2,
                  background: '#FFB300',
                },
              },
              '&:hover': {
                background: 'rgba(255,255,255,0.08)',
                boxShadow: '0 2px 8px 0 rgba(108,71,255,0.10)',
              },
              px: 2.5,
              py: 1.2,
            }}
          >
            <ListItemIcon sx={{ color: '#fff', minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.10)', my: 1 }} />
      <List>
        <ListItem button onClick={() => navigate('/settings')} sx={{ color: '#fff', borderRadius: 2, mx: 1, mb: 1, px: 2.5, py: 1.2 }}>
          <ListItemIcon sx={{ color: '#fff', minWidth: 36 }}><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button onClick={() => navigate('/help')} sx={{ color: '#fff', borderRadius: 2, mx: 1, mb: 1, px: 2.5, py: 1.2 }}>
          <ListItemIcon sx={{ color: '#fff', minWidth: 36 }}><HelpOutlineIcon /></ListItemIcon>
          <ListItemText primary="Help" />
        </ListItem>
      </List>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 2, mb: 1 }}>
        <Avatar sx={{ bgcolor: '#FFB300', width: 36, height: 36, fontWeight: 700 }}>
          {user?.name ? user.name[0] : 'U'}
        </Avatar>
        <Box sx={{ fontWeight: 600, fontSize: 16, ml: 1 }}>{user?.name || 'Demo User'}</Box>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.10)' }} />
      <List>
        <ListItem button onClick={handleLogout} sx={{ color: '#fff', borderRadius: 2, mx: 1, mb: 2, px: 2.5, py: 1.2 }}>
          <ListItemIcon sx={{ color: '#fff', minWidth: 36 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );
} 