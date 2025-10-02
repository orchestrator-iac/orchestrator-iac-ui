import React, { useState, useMemo, useEffect } from "react";
import DOMPurify from 'dompurify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Note } from "@/types/Note";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onEdit }) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };
  const handleMenuClose = () => setMenuAnchor(null);

  const sanitized = useMemo(() => DOMPurify.sanitize(note.content || ''), [note.content]);

  // Read-only tiptap instance for displaying formatted content
  const displayEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link.configure({ openOnClick: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] })
    ],
    content: sanitized,
    editable: false,
    editorProps: {
      attributes: {
        class: 'note-rich-editor note-readonly',
        style: 'font-size:0.9rem;'
      }
    }
  });

  // Update editor content if note changes
  useEffect(() => {
    if (displayEditor && sanitized !== displayEditor.getHTML()) {
      displayEditor.commands.setContent(sanitized, false);
    }
  }, [sanitized, displayEditor]);

  return (
    <Card
      sx={{
        backgroundColor: 'background.paper',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      {/* Action trigger button (does not affect layout height) */}
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        aria-label="note actions"
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          zIndex: 2,
          backgroundColor: 'rgba(0,0,0,0.04)',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' }
        }}
      >
        <MoreVertIcon fontSize="small" color="primary" />
      </IconButton>

      <Popover
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 0.5, borderRadius: 50 } } }}
      >
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => { handleMenuClose(); onEdit(note); }}>
              <EditIcon fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => { handleMenuClose(); onDelete(note.id); }}>
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        </Box>
      </Popover>
      <CardContent
        sx={{
          pt: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ flex: 1, wordBreak: 'break-word', color: 'text.primary' }}>
          {displayEditor ? <EditorContent editor={displayEditor} /> : (
            <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: sanitized }} />
          )}
        </Box>
        {/* Footer date (muted) */}
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            {note?.updatedAt
              ? new Date(note.updatedAt).toLocaleDateString()
              : '—'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
