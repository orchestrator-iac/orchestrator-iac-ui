import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Box, IconButton, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

interface RichNoteEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
  placeholder?: string;
}

const RichNoteEditor: React.FC<RichNoteEditorProps> = ({ value, onChange, minHeight = 120, placeholder }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editorProps: {
      attributes: {
        style: `min-height:${minHeight}px; padding:8px 12px; outline:none;`,
        class: 'note-rich-editor'
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, borderBottom: '1px solid', borderColor: 'divider', background: 'background.paper' }}>
        <Tooltip title="Bold"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run() } color={editor.isActive('bold') ? 'primary' : 'default'}><FormatBoldIcon fontSize="small" /></IconButton></span></Tooltip>
        <Tooltip title="Italic"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run() } color={editor.isActive('italic') ? 'primary' : 'default'}><FormatItalicIcon fontSize="small" /></IconButton></span></Tooltip>
        <Tooltip title="Bullet List"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run() } color={editor.isActive('bulletList') ? 'primary' : 'default'}><FormatListBulletedIcon fontSize="small" /></IconButton></span></Tooltip>
        <Tooltip title="Numbered List"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run() } color={editor.isActive('orderedList') ? 'primary' : 'default'}><FormatListNumberedIcon fontSize="small" /></IconButton></span></Tooltip>
      </Box>
      <EditorContent editor={editor} />
      {placeholder && !value && <Box sx={{ position: 'absolute', pointerEvents: 'none', opacity: 0.4, top: 46, left: 16 }}>{placeholder}</Box>}
    </Box>
  );
};

export default RichNoteEditor;
