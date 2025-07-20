import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Fab
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Avatar from '@mui/material/Avatar';

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee_id: '',
    due_date: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [labels, setLabels] = useState(['Bug', 'Feature', 'Improvement', 'Urgent']);
  const [selectedLabels, setSelectedLabels] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/projects'),
        axios.get('/api/users')
      ]);
      
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      assignee_id: '',
      due_date: ''
    });
    setOpenTaskDialog(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assignee_id: task.assignee_id || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
    setOpenTaskDialog(true);
  };

  const handleSaveTask = async () => {
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask.id}`, {
          ...taskForm,
          project_id: editingTask.project_id
        });
        setSuccess('Task updated successfully!');
      } else {
        if (selectedProject === 'all') {
          setError('Please select a project first');
          return;
        }
        await axios.post('/api/tasks', {
          ...taskForm,
          project_id: parseInt(selectedProject)
        });
        setSuccess('Task created successfully!');
      }
      
      setOpenTaskDialog(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchData();
      setSuccess('Task status updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update task status');
    }
  };

  const filteredTasks = selectedProject === 'all' 
    ? tasks 
    : tasks.filter(task => task.project_id === parseInt(selectedProject));

  const columns = [
    { id: 'todo', title: 'To Do', color: '#ff9800' },
    { id: 'in_progress', title: 'In Progress', color: '#2196f3' },
    { id: 'completed', title: 'Completed', color: '#4caf50' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      case 'critical':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getAssigneeName = (assigneeId) => {
    const assignee = users.find(u => u.id === assigneeId);
    return assignee ? assignee.name : 'Unassigned';
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    await handleStatusChange(taskId, newStatus);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { text: newComment, date: new Date().toISOString() }]);
      setNewComment('');
    }
  };

  const handleLabelToggle = (label) => {
    setSelectedLabels(selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label]);
  };

  const handleDeleteTask = async () => {
    if (editingTask && window.confirm('Are you sure you want to delete this task?')) {
      await axios.delete(`/api/tasks/${editingTask.id}`);
      setOpenTaskDialog(false);
      fetchData();
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Kanban Board
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Project</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                label="Filter by Project"
              >
                <MenuItem value="all">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTask}
              disabled={selectedProject === 'all'}
            >
              Add Task
            </Button>
          </Box>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container spacing={2}>
            {columns.map((col) => (
              <Grid item xs={12} md={4} key={col.id}>
                <Typography variant="h6" sx={{ color: col.color, mb: 1 }}>
                  {col.title} ({filteredTasks.filter(t => t.status === col.id).length})
                </Typography>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: 400,
                        bgcolor: snapshot.isDraggingOver ? '#e3f2fd' : '#fff',
                        borderRadius: 2,
                        p: 1,
                        boxShadow: 1,
                        transition: 'background 0.2s',
                      }}
                    >
                      {filteredTasks.filter(t => t.status === col.id).map((task, idx) => (
                        <Draggable draggableId={task.id.toString()} index={idx} key={task.id}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                mb: 2,
                                boxShadow: snapshot.isDragging ? 6 : 2,
                                borderLeft: `6px solid`,
                                borderColor: getPriorityColor(task.priority),
                                transition: 'box-shadow 0.2s',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleEditTask(task)}
                            >
                              <CardContent sx={{ pb: '8px !important' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: 'primary.main', fontSize: 14 }}>
                                    {getAssigneeName(task.assignee_id)[0]}
                                  </Avatar>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
                                    {task.title}
                                  </Typography>
                                  <Chip
                                    label={task.priority}
                                    size="small"
                                    color={getPriorityColor(task.priority)}
                                    sx={{ ml: 1, textTransform: 'capitalize' }}
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  {task.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Due: {task.due_date ? task.due_date.split('T')[0] : '-'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {getAssigneeName(task.assignee_id)}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Grid>
            ))}
          </Grid>
        </DragDropContext>
      </Box>

      {/* Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Assignee</InputLabel>
            <Select
              value={taskForm.assignee_id}
              onChange={(e) => setTaskForm({ ...taskForm, assignee_id: e.target.value })}
              label="Assignee"
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="date"
            label="Due Date"
            value={taskForm.due_date}
            onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {labels.map(label => (
              <Chip
                key={label}
                label={label}
                color={selectedLabels.includes(label) ? 'primary' : 'default'}
                onClick={() => handleLabelToggle(label)}
                variant={selectedLabels.includes(label) ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>

          {/* Comments Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Comments</Typography>
            <Box sx={{ maxHeight: 120, overflowY: 'auto', mb: 1 }}>
              {comments.length === 0 && <Typography color="text.secondary">No comments yet.</Typography>}
              {comments.map((c, idx) => (
                <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2">{c.text}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(c.date).toLocaleString()}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
              />
              <Button onClick={handleAddComment} variant="contained">Add</Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteTask} color="error" startIcon={<DeleteIcon />}>Delete</Button>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained">
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default KanbanBoard; 