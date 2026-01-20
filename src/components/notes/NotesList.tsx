import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  CardContent,
  Typography,
  Card,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import NoteCard from "./NoteCard";
import { Note } from "@/types/Note";
import RichNoteEditor from "./RichNoteEditor";
import { useNotes } from "@/hooks/useNotes";

const NotesList: React.FC = () => {
  const {
    notes,
    filteredNotes,
    searchQuery,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    handleSearch,
    clearSearch,
    isContentEmpty,
  } = useNotes();

  const [newNote, setNewNote] = useState("");
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const scrollPosRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Show error when error state changes
  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  useEffect(() => {
    if (editorOpen) {
      scrollPosRef.current = window.scrollY;
      // Optionally scroll to top for focused editing
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // restore previous scroll position after slight delay to allow layout
      setTimeout(
        () =>
          window.scrollTo({
            top: scrollPosRef.current,
            behavior: "instant" as ScrollBehavior,
          }),
        50,
      );
    }
  }, [editorOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editorOpen) {
        setEditorOpen(false);
        setEditNote(null);
        setNewNote("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editorOpen]);

  const handleAddNote = async () => {
    if (isContentEmpty(newNote)) return;

    try {
      await createNote(newNote);
      setNewNote("");
      setEditorOpen(false);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleEditNote = (note: Note) => {
    setEditNote(note);
    setNewNote(note.content);
    setEditorOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editNote || isContentEmpty(newNote)) return;

    try {
      await updateNote(editNote.id, newNote);
      setEditNote(null);
      setNewNote("");
      setEditorOpen(false);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{ width: "100%", minHeight: 400, position: "relative" }}
    >
      {!editorOpen && (
        <Box>
          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={clearSearch}
                      sx={{ minWidth: "auto", p: 0.5 }}
                    >
                      <ClearIcon fontSize="small" />
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Loading Indicator */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Notes Grid */}
          {!loading && (
            <Masonry columns={{ xs: 1, sm: 2, md: 4 }} spacing={2}>
              <Card
                sx={{
                  minHeight: 200,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": {
                    transform: "scale(1.02)",
                    transition: "transform 0.2s",
                  },
                }}
              >
                <CardContent
                  sx={{ textAlign: "center" }}
                  onClick={() => {
                    setEditNote(null);
                    setNewNote("");
                    setEditorOpen(true);
                  }}
                >
                  <AddIcon
                    sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                  />
                  <Typography color="text.secondary">Add New Note</Typography>
                </CardContent>
              </Card>
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDeleteNote}
                  onEdit={handleEditNote}
                />
              ))}
            </Masonry>
          )}

          {/* No Notes Message */}
          {!loading && filteredNotes.length === 0 && notes.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notes yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click the "Add New Note" button to create your first note.
              </Typography>
            </Box>
          )}

          {/* No Search Results Message */}
          {!loading &&
            searchQuery &&
            filteredNotes.length === 0 &&
            notes.length > 0 && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No notes found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search terms or{" "}
                  <Button variant="text" size="small" onClick={clearSearch}>
                    clear search
                  </Button>
                </Typography>
              </Box>
            )}
        </Box>
      )}

      {editorOpen && (
        <Box
          sx={{
            width: "100%",
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            background: "background.paper",
          }}
        >
          <RichNoteEditor
            value={newNote}
            onChange={setNewNote}
            placeholder="Write your note here..."
            minHeight={300}
            advanced
            autoFocus
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {editNote
                ? "Last updated: " +
                  new Date(editNote.updatedAt).toLocaleString()
                : "Creating new note"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {loading && <CircularProgress size={20} />}
              <Button
                size="small"
                onClick={() => {
                  setEditorOpen(false);
                  setEditNote(null);
                  setNewNote("");
                }}
                disabled={loading}
              >
                Discard (Esc)
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={isContentEmpty(newNote) || loading}
                onClick={editNote ? handleSaveEdit : handleAddNote}
              >
                {(() => {
                  if (loading) return "Saving...";
                  if (editNote) return "Save Changes";
                  return "Create Note";
                })()}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotesList;
