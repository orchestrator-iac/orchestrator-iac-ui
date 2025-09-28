import React, { useState } from "react";
import {
  Box,
  Button,
  CardContent,
  Typography,
  Card,
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
  const [isAdding, setIsAdding] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);

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
      setIsAdding(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditNote(note);
    setNewNote(note.content);
    setIsAdding(true);
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
      setIsAdding(false);
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
              transform: isAdding ? 'none' : 'scale(1.02)',
              transition: 'transform 0.2s'
            }
          }}
        >
          {isAdding ? (
            <CardContent sx={{ width: 'calc(100% - 32px)', mt: 2, p: 0 }}>
              <Box sx={{ mb: 2 }}>
                <RichNoteEditor
                  value={newNote}
                  onChange={setNewNote}
                  placeholder="Write your note here..."
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  onClick={() => {
                    setIsAdding(false);
                    setNewNote("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained"
                  onClick={editNote ? handleSaveEdit : handleAddNote}
                  disabled={!newNote.trim()}
                >
                  {editNote ? 'Save' : 'Add'}
                </Button>
              </Box>
            </CardContent>
          ) : (
            <CardContent 
              sx={{ textAlign: 'center' }}
              onClick={() => setIsAdding(true)}
            >
              <AddIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography color="text.secondary">Add New Note</Typography>
            </CardContent>
          )}
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
    </Box>
  );
};

export default NotesList;
