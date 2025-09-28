import React, { useState, useMemo } from "react";
import DOMPurify from 'dompurify';
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
import { Note } from "@/types/Note";
import { CirclePicker } from 'react-color';

interface NoteCardProps {
  note: Note;
  colors: string[];
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  colors,
  onDelete,
  onEdit,
}) => {
  const theme = useTheme();
  const [showHeader, setShowHeader] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleColorChange = (color: any) => {
    onEdit({ ...note, color: color.hex });
    setShowColorPicker(false);
  };

  const sanitized = useMemo(() => DOMPurify.sanitize(note.content || ''), [note.content]);

  return (
    <Card
      sx={{
        backgroundColor: note.color || "#fff9c4",
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
      onMouseEnter={() => setShowHeader(true)}
      onMouseLeave={() => {
        setShowHeader(false);
        setShowColorPicker(false);
      }}
    >
      {/* Header with actions */}
      {showHeader && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            zIndex: 2
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {new Date(note.updatedAt).toLocaleDateString()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Current Color */}
            <Box
              sx={{
                backgroundColor: note.color || "#fff9c4",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: `2px solid ${theme.palette.primary.main}`,
                cursor: "pointer",
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)'
                }
              }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            <IconButton
              size="small"
              onClick={() => onEdit(note)}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(note.id)}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: theme.palette.error.main }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Color Picker */}
      {showColorPicker && (
        <Box
          sx={{
            position: 'absolute',
            top: '48px',
            right: '8px',
            backgroundColor: 'white',
            padding: 1,
            borderRadius: 1,
            boxShadow: theme.shadows[3],
            zIndex: 3
          }}
        >
          <CirclePicker
            colors={colors}
            color={note.color || "#fff9c4"}
            onChange={handleColorChange}
            width="220px"
          />
        </Box>
      )}

      {/* Note Content */}
      <CardContent 
        sx={{ 
          pt: showHeader ? 6 : 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography
          variant="body1"
          component="div"
          sx={{
            wordBreak: "break-word",
            flex: 1,
            color: 'text.primary'
          }}
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      </CardContent>
    </Card>
  );
};

export default NoteCard;
