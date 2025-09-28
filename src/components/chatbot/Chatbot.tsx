import React, { useState } from 'react';
import { Box, IconButton, Paper, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import NotesList from '@/components/notes/NotesList';

// Floating button + compact chat panel + separate notes modal

const Chatbot: React.FC = () => {
  const [openChat, setOpenChat] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);

  const toggleChat = () => setOpenChat(o => !o);
  const openNotes = () => setNotesOpen(true);
  const closeNotes = () => setNotesOpen(false);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(m => [...m, { id: crypto.randomUUID(), role, content }]);
  };

  const interpret = (text: string) => {
    const lower = text.toLowerCase();
    const noteIntent = /(note|memo|sticky)/;
    const createIntent = /(create|add|new|make)/;
    const showIntent = /(show|list|display|open|view)/;

    if (noteIntent.test(lower) && (createIntent.test(lower) || showIntent.test(lower))) {
      addMessage('assistant', 'Opening notes workspace for you.');
      setNotesOpen(true);
      return;
    }
    if (noteIntent.test(lower)) {
      addMessage('assistant', 'Ask me to create or show notes. Example: "show my notes".');
      return;
    }
    addMessage('assistant', 'I currently only help with notes. Try: "create a new note".');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    addMessage('user', trimmed);
    interpret(trimmed);
    setInput('');
  };

  return (
    <>
      {/* Floating Launcher */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
        <IconButton color="primary" onClick={toggleChat} size="large" sx={{ bgcolor: 'background.paper', boxShadow: 3 }}>
          {openChat ? <CloseIcon /> : <ChatIcon />}
        </IconButton>
      </Box>

      {/* Compact Chat Panel */}
      {openChat && (
        <Paper elevation={6} sx={{ position: 'fixed', bottom: 90, right: 24, width: 360, height: 420, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', zIndex: 1300 }}>
          <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={600}>Assistant</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={openNotes} color="primary" sx={{ bgcolor: 'action.hover' }} title="Open Notes">
                <DescriptionIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={toggleChat}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {messages.length === 0 && (
              <Typography variant="body2" color="text.secondary">Type: "show my notes" or "create a new note".</Typography>
            )}
            {messages.map(m => (
              <Box key={m.id} sx={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', bgcolor: m.role === 'user' ? 'primary.main' : 'background.default', color: m.role === 'user' ? 'primary.contrastText' : 'text.primary', px: 1.25, py: 0.75, borderRadius: 2, boxShadow: 1, fontSize: 13, lineHeight: 1.4 }}>
                {m.content}
              </Box>
            ))}
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
            <TextField size="small" fullWidth value={input} onChange={e => setInput(e.target.value)} placeholder="Message..." />
            <Button type="submit" variant="contained" size="small" disabled={!input.trim()}>Send</Button>
          </Box>
        </Paper>
      )}

      {/* Notes Modal */}
      <Dialog open={notesOpen} onClose={closeNotes} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>Your Notes</Typography>
          <IconButton onClick={closeNotes} size="small"><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <NotesList />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNotes}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Chatbot;
