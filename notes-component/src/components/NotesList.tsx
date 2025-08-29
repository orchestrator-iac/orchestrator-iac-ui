import React from 'react';
import NoteCard from './NoteCard';
import { Note } from '../types/Note';

interface NotesListProps {
  notes: Note[];
}

const NotesList: React.FC<NotesListProps> = ({ notes }) => {
  return (
    <div>
      {notes.map(note => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
};

export default NotesList;