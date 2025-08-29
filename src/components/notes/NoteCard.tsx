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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                position: "relative",
                marginLeft: "8px",
              }}
            >
              {/* Current Color */}
              <Box
                sx={{
                  backgroundColor: note.color || "#fff9c4",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  border: `2px solid ${theme.palette.primary.main}`,
                  cursor: "pointer",
                  position: "relative",
                  "&:hover + .colorOptions": {
                    display: "flex",
                  },
                }}
              />
              {/* Color Options */}
              <Box
                className="colorOptions"
                sx={{
                  display: "none",
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  backgroundColor: theme.palette.background.paper,
                  padding: "8px",
                  borderRadius: "12px",
                  boxShadow: theme.shadows[2],
                  gap: 0.5,
                  zIndex: 2,
                  "&:hover": {
                    display: "flex",
                  },
                }}
              >
                {colors.map((color) => (
                  <Box
                    key={color}
                    sx={{
                      backgroundColor: color,
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border:
                        color === note.color
                          ? `2px solid ${theme.palette.primary.main}`
                          : `2px solid ${theme.palette.background.inverted}`,
                      cursor: "pointer",
                      "&:hover": {
                        transform: "scale(1.2)",
                        transition: "transform 0.2s",
                      },
                    }}
                    onClick={() => onEdit({ ...note, color })}
                  />
                ))}
              </Box>
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
