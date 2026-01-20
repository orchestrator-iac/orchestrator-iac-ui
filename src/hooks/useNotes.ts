import { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import { Note } from "@/types/Note";
import {
  notesService,
  CreateNoteRequest,
  UpdateNoteRequest,
} from "@/services/notesService";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Initialize Fuse.js for fuzzy search
  const fuseRef = useRef<Fuse<Note> | null>(null);

  useEffect(() => {
    fuseRef.current = new Fuse(notes, {
      keys: ["plainText", "content"],
      threshold: 0.3, // Fuzzy matching threshold
      includeScore: true,
    });
  }, [notes]);

  // Load notes on hook initialization
  useEffect(() => {
    loadNotes();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes);
      return;
    }

    if (fuseRef.current) {
      const results = fuseRef.current.search(searchQuery);
      setFilteredNotes(results.map((result) => result.item));
    }
  }, [searchQuery, notes]);

  // Utility functions
  const getPlainText = (html: string) =>
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  const isContentEmpty = (html: string) => getPlainText(html).length === 0;

  // API functions
  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await notesService.getNotes();
      setNotes(fetchedNotes);
      setError("");
    } catch (err) {
      setError("Failed to load notes. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (content: string): Promise<Note> => {
    if (isContentEmpty(content)) {
      throw new Error("Note content cannot be empty");
    }

    try {
      setLoading(true);
      const noteData: CreateNoteRequest = {
        content,
        plainText: getPlainText(content),
      };
      const createdNote = await notesService.createNote(noteData);
      setNotes((prev) => [...prev, createdNote]);
      setError("");
      return createdNote;
    } catch (err) {
      setError("Failed to create note. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id: string, content: string): Promise<Note> => {
    if (isContentEmpty(content)) {
      throw new Error("Note content cannot be empty");
    }

    try {
      setLoading(true);
      const updateData: UpdateNoteRequest = {
        content,
        plainText: getPlainText(content),
      };
      const updatedNote = await notesService.updateNote(id, updateData);
      setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
      setError("");
      return updatedNote;
    } catch (err) {
      setError("Failed to update note. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await notesService.deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setError("");
    } catch (err) {
      setError("Failed to delete note. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return {
    // State
    notes,
    filteredNotes,
    searchQuery,
    loading,
    error,

    // Actions
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    handleSearch,
    clearSearch,

    // Utilities
    getPlainText,
    isContentEmpty,
  };
};
