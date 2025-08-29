import React, { useState } from "react";
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
import styles from "./NoteCard.module.css";

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

  return (
    <Card
      className={styles.note}
      sx={{
        color: "#333",
        backgroundColor: note.color || "#fff9c4",
      }}
      onMouseEnter={() => setShowHeader(true)}
      onMouseLeave={() => setShowHeader(true)}
    >
      <Box className={styles.header}>
        {showHeader && (
          <>
            <Typography variant="caption">
              {new Date(note.updatedAt).toLocaleDateString()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.1 }}>
              {colors.map((color) => (
                <Box
                  key={color}
                  sx={{
                    backgroundColor: color,
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    border:
                      color === note.color
                        ? `2px solid ${theme.palette.primary.main}`
                        : `2px solid ${theme.palette.background.paper}`,
                    marginRight: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    /* Change note color */
                  }}
                ></Box>
              ))}
            </Box>
            <IconButton
              size="small"
              sx={{ color: "inherit" }}
              onClick={() => onEdit(note)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "inherit" }}
              onClick={() => onDelete(note.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
      <CardContent sx={{ pt: 2 }}>
        <Typography
          variant="body1"
          style={{ whiteSpace: "pre-wrap", lineBreak: "anywhere" }}
        >
          {note.content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
