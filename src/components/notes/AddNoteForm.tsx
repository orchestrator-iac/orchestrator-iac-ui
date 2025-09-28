import React, { useState } from 'react';
import RichNoteEditor from './RichNoteEditor';

interface Props { onAddNote: (title: string, contentHtml: string) => void }

const AddNoteForm: React.FC<Props> = ({ onAddNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onAddNote(title.trim(), content);
      setTitle('');
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="text"
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{ padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6 }}
      />
      <RichNoteEditor value={content} onChange={setContent} placeholder="Write your note..." minHeight={160} />
      <button type="submit" style={{ padding: '8px 14px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>
        Add Note
      </button>
    </form>
  );
};

export default AddNoteForm;