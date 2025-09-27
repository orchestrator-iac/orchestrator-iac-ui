import React, { useState } from 'react';

const AddNoteForm: React.FC<{ onAddNote: (title: string, content: string) => void }> = ({ onAddNote }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && content) {
            onAddNote(title, content);
            setTitle('');
            setContent('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Note Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
            />
            <button type="submit">Add Note</button>
        </form>
    );
};

export default AddNoteForm;