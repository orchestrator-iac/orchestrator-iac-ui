import apiService from "./apiService";
import { Note } from "@/types/Note";

export interface CreateNoteRequest {
  content: string;
  plainText?: string;
}

export interface UpdateNoteRequest {
  content: string;
  plainText?: string;
}

export interface PaginatedNotesResponse {
  notes: Note[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export const notesService = {
  // Get all notes for the authenticated user
  getNotes: async (): Promise<Note[]> => {
    try {
      const data = await apiService.get("/notes");
      // Handle paginated response structure
      const notes = data.notes || data; // Support both paginated and direct array responses
      // Convert date strings to Date objects
      return notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      throw new Error("Failed to fetch notes");
    }
  },

  // Create a new note
  createNote: async (noteData: CreateNoteRequest): Promise<Note> => {
    try {
      const data = await apiService.post("/notes", noteData);
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error("Failed to create note:", error);
      throw new Error("Failed to create note");
    }
  },

  // Update an existing note
  updateNote: async (
    id: string,
    noteData: UpdateNoteRequest
  ): Promise<Note> => {
    try {
      const data = await apiService.put(`/notes/${id}`, noteData);
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error("Failed to update note:", error);
      throw new Error("Failed to update note");
    }
  },

  // Delete a note
  deleteNote: async (id: string): Promise<void> => {
    try {
      await apiService.delete(`/notes/${id}`);
    } catch (error) {
      console.error("Failed to delete note:", error);
      throw new Error("Failed to delete note");
    }
  },

  // Search notes (optional backend implementation)
  searchNotes: async (query: string): Promise<Note[]> => {
    try {
      const data = await apiService.get(
        `/notes/search?q=${encodeURIComponent(query)}`
      );
      // Handle paginated response structure
      const notes = data.notes || data; // Support both paginated and direct array responses
      return notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error("Failed to search notes:", error);
      // Fallback to client-side search if server search fails
      throw new Error("Failed to search notes");
    }
  },
};
