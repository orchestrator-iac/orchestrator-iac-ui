import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  CardContent,
  Typography,
  Card
} from "@mui/material"; // removed Slide
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
  const [editorOpen, setEditorOpen] = useState(false); // reuse flag to mean "show editor instead of list"
  const scrollPosRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorOpen) {
      scrollPosRef.current = window.scrollY;
      // Optionally scroll to top for focused editing
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // restore previous scroll position after slight delay to allow layout
      setTimeout(() => window.scrollTo({ top: scrollPosRef.current, behavior: 'instant' as ScrollBehavior }), 50);
    }
  }, [editorOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editorOpen) {
        setEditorOpen(false);
        setEditNote(null);
        setNewNote('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editorOpen]);

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
      setNotes(notes.map(n => n.id === editNote.id ? { ...editNote, content: newNote, plainText: newNote.replace(/<[^>]+>/g, ''), updatedAt: new Date() } : n));
      setEditNote(null);
      setNewNote("");
      setEditorOpen(false);
    }
  };

  const handleDeleteNote = (id: string) => setNotes(notes.filter(note => note.id !== id));

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  return (
    <Box ref={containerRef} sx={{ width: "100%", minHeight: 400, position: 'relative' }}>
      {!editorOpen && (
        <Box>
          <Masonry columns={{ xs: 1, sm: 2, md: 4 }} spacing={2}>
            <Card sx={{ minHeight: 200, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' } }}>
              <CardContent sx={{ textAlign: 'center' }} onClick={() => { setEditNote(null); setNewNote(''); setEditorOpen(true); }}>
                <AddIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">Add New Note</Typography>
              </CardContent>
            </Card>
            {notes.map(note => (
              <NoteCard key={note.id} note={note} colors={colors} onDelete={handleDeleteNote} onEdit={handleEditNote} />
            ))}
          </Masonry>
        </Box>
      )}

      {editorOpen && (
        <Box sx={{ width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2, background: 'background.paper' }}>
          <RichNoteEditor
            value={newNote}
            onChange={setNewNote}
            placeholder="Write your note here..."
            minHeight={300}
            advanced
            autoFocus
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {editNote ? 'Last updated: ' + new Date(editNote.updatedAt).toLocaleString() : 'Creating new note'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={() => { setEditorOpen(false); setEditNote(null); setNewNote(''); }}>Discard (Esc)</Button>
              <Button size="small" variant="contained" disabled={!newNote.trim()} onClick={editNote ? handleSaveEdit : handleAddNote}>{editNote ? 'Save Changes' : 'Create Note'}</Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default NotesList;
