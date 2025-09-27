export const addNote = (notes: Note[], newNote: Note): Note[] => {
    return [...notes, newNote];
};

export const deleteNote = (notes: Note[], noteId: string): Note[] => {
    return notes.filter(note => note.id !== noteId);
};

export const updateNote = (notes: Note[], updatedNote: Note): Note[] => {
    return notes.map(note => note.id === updatedNote.id ? updatedNote : note);
};