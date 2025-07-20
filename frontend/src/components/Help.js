import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Link } from '@mui/material';

export default function Help() {
  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>Help & Support</Typography>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Frequently Asked Questions</Typography>
        <List>
          <ListItem>
            <ListItemText primary="How do I create a new project?" secondary="Click the 'Add Project' button on the Projects page and fill in the details." />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="How can I assign tasks?" secondary="Go to the Kanban Board, click on a task, and select an assignee from the dropdown." />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="How do I change my profile info?" secondary="Profile editing will be available soon in the Settings page." />
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Contact Support</Typography>
        <Typography>Email: <Link href="mailto:support@flowboard-demo.com">support@flowboard-demo.com</Link></Typography>
        <Typography>Docs: <Link href="#" target="_blank">View Documentation (coming soon)</Link></Typography>
      </Paper>
    </Box>
  );
} 