import React, { useState } from "react";
import RichNoteEditor from "./RichNoteEditor";
import "./AddNoteForm.css";

interface Props {
  onAddNote: (title: string, contentHtml: string) => void;
}

const AddNoteForm: React.FC<Props> = ({ onAddNote }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onAddNote(title.trim(), content);
      setTitle("");
      setContent("");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="add-note-form">
      <input
        type="text"
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="add-note-input"
      />
      <RichNoteEditor
        value={content}
        onChange={setContent}
        placeholder="Write your note..."
        minHeight={160}
      />
      <button type="submit" className="add-note-button">
        Add Note
      </button>
    </form>
  );
};

export default AddNoteForm;
