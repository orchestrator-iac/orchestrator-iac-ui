const React from 'react';
import { Note } from '../types/Note';
import './notes.styles.ts';

interface NoteCardProps {
    note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
    return (
        <div className="note-card">
            <h3 className="note-title">{note.title}</h3>
            <p className="note-content">{note.content}</p>
        </div>
    );
};

export default NoteCard;