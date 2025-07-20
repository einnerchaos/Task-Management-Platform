import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import { Box } from '@mui/material';
import Projects from './components/Projects';
import Users from './components/Users';
import ProjectDetail from './components/ProjectDetail';
import Settings from './components/Settings';
import Help from './components/Help';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6C47FF', // vibrant purple
      contrastText: '#fff',
    },
    secondary: {
      main: '#FFB300', // orange accent
      contrastText: '#fff',
    },
    background: {
      default: '#f7f8fa',
      paper: '#fff',
    },
    sidebar: {
      main: '#232946', // dark navy
    },
    success: {
      main: '#43A047',
    },
    info: {
      main: '#00B8D9',
    },
    warning: {
      main: '#FFB300',
    },
    error: {
      main: '#FF5630',
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif',
    fontWeightBold: 700,
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
});

function App() {
  useEffect(() => {
    document.title = 'Task Management Platform';
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f4f6fa', p: 0 }}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/kanban" 
                  element={
                    <PrivateRoute>
                      <KanbanBoard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/projects" 
                  element={
                    <PrivateRoute>
                      <Projects />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/projects/:id" 
                  element={
                    <PrivateRoute>
                      <ProjectDetail />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/users" 
                  element={
                    <PrivateRoute>
                      <Users />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/help" 
                  element={
                    <PrivateRoute>
                      <Help />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 