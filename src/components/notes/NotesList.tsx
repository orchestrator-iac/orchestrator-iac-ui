import React, { useState } from "react";
import {
  Box,
  Button,
  CardContent,
  Typography,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid";
import NoteCard from "./NoteCard";
import { Note } from "@/types/Note";
import RichNoteEditor from './RichNoteEditor';

const NotesList: React.FC = () => {
  const colors = ["#fff9c4", "#f0f4c3", "#e8f5e9", "#e3f2fd", "#f3e5f5"];
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: uuidv4(),
        content: newNote,
        plainText: newNote.replace(/<[^>]+>/g, ''),
        color: getRandomColor(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([...notes, note]);
      setNewNote("");
      setEditorOpen(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditNote(note);
    setNewNote(note.content);
    setEditorOpen(true);
  };

  const handleSaveEdit = () => {
    if (editNote) {
      setNotes(
        notes.map((n) =>
          n.id === editNote.id
            ? { ...editNote, content: newNote, plainText: newNote.replace(/<[^>]+>/g, ''), updatedAt: new Date() }
            : n
        )
      );
      setEditNote(null);
      setNewNote("");
      setEditorOpen(false);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Box sx={{ width: "100%", minHeight: 400 }}>
      <Masonry columns={{ xs: 1, sm: 2, md: 4 }} spacing={2}>
        <Card
          sx={{ 
            minHeight: 200,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            '&:hover': {
              transform: 'scale(1.02)',
              transition: 'transform 0.2s'
            }
          }}
        >
          <CardContent 
            sx={{ textAlign: 'center' }}
            onClick={() => { setEditNote(null); setNewNote(''); setEditorOpen(true); }}
          >
            <AddIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">Add New Note</Typography>
          </CardContent>
        </Card>

        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            colors={colors}
            onDelete={handleDeleteNote}
            onEdit={handleEditNote}
          />
        ))}
      </Masonry>

      <Dialog open={editorOpen} onClose={() => { setEditorOpen(false); setEditNote(null); }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
          <Typography variant="h6" fontSize={16}>{editNote ? 'Edit Note' : 'New Note'}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => { setEditorOpen(false); setEditNote(null); }}>Cancel</Button>
            <Button size="small" variant="contained" disabled={!newNote.trim()} onClick={editNote ? handleSaveEdit : handleAddNote}>{editNote ? 'Save' : 'Add'}</Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2, pt: 1 }}>
          <RichNoteEditor
            value={newNote}
            onChange={setNewNote}
            placeholder="Write your note here..."
            minHeight={220}
            advanced
            compact
          />
        </DialogContent>
        <DialogActions sx={{ p: 1.5, pt: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            {editNote ? 'Last updated: ' + new Date(editNote.updatedAt).toLocaleString() : 'Creating new note'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => { setEditorOpen(false); setEditNote(null); }}>Close</Button>
            <Button size="small" variant="contained" disabled={!newNote.trim()} onClick={editNote ? handleSaveEdit : handleAddNote}>{editNote ? 'Save Changes' : 'Create Note'}</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotesList;
