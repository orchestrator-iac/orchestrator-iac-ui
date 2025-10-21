import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Switch,
} from '@mui/material';
import { Node, Edge } from '@xyflow/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import DownloadIcon from '@mui/icons-material/Download';
import { SaveButton } from '../save';
import { DeleteButton } from '../delete';
import { TemplateInfo } from '../../../types/orchestrator';
import { downloadFlowAsImage } from '../utils/downloadImage.ts';

interface OrchestratorMenuProps {
  nodes: Node[];
  edges: Edge[];
  templateInfo: TemplateInfo;
  currentOrchestratorId: string | null;
  onSaveSuccess: (orchestratorId: string) => void;
  orchestratorName?: string;
  isArchitectureMode: boolean;
  onArchitectureModeChange: (value: boolean) => void;
}

export const OrchestratorMenu: React.FC<OrchestratorMenuProps> = ({
  nodes,
  edges,
  templateInfo,
  currentOrchestratorId,
  onSaveSuccess,
  orchestratorName,
  isArchitectureMode,
  onArchitectureModeChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  const canSave = nodes.length > 0;
  const canDelete = !!currentOrchestratorId;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSaveClick = () => {
    setSaveDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDownloadImage = async () => {
    handleMenuClose();
    try {
      await downloadFlowAsImage({
        fileName: orchestratorName ? `${orchestratorName}.png` : 'orchestrator.png',
        backgroundColor: '#ffffff',
      });
    } catch (error) {
      console.error('Failed to download orchestrator image', error);
    }
  };

  return (
    <>
      <Tooltip title="Orchestrator Menu" arrow>
        <IconButton
          onClick={handleMenuClick}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
              boxShadow: 4,
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              boxShadow: 3,
            },
          },
        }}
      >
        <MenuItem
          disableRipple
          onClick={(event) => {
            event.stopPropagation();
          }}
          sx={{ alignItems: 'center', gap: 1 }}
        >
          <ListItemIcon>
            <ArchitectureIcon
              fontSize="small"
              color={isArchitectureMode ? 'primary' : 'inherit'}
            />
          </ListItemIcon>
          <ListItemText
            primary="Architecture mode"
            secondary={isArchitectureMode ? 'Compact cards' : 'Detailed forms'}
            slotProps={{ primary: { sx: { fontWeight: 500 } } }}
            sx={{ cursor: 'pointer', mr: 1 }}
            onClick={(event) => {
              event.stopPropagation();
              onArchitectureModeChange(!isArchitectureMode);
            }}
          />
          <Switch
            edge="end"
            size="small"
            checked={isArchitectureMode}
            onChange={(_, checked) => onArchitectureModeChange(checked)}
            onClick={(event) => {
              event.stopPropagation();
            }}
            slotProps={{ input: { 'aria-label': 'Toggle architecture mode' } }}
          />
        </MenuItem>

        <MenuItem onClick={handleDownloadImage}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Download as Image</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleSaveClick} disabled={!canSave}>
          <ListItemIcon>
            <SaveIcon fontSize="small" color={canSave ? 'primary' : 'disabled'} />
          </ListItemIcon>
          <ListItemText>Save Orchestrator</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={handleDeleteClick}
          disabled={!canDelete}
          sx={{ color: canDelete ? 'error.main' : 'text.disabled' }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color={canDelete ? 'error' : 'disabled'} />
          </ListItemIcon>
          <ListItemText>Delete Orchestrator</ListItemText>
        </MenuItem>
      </Menu>

      {/* Hidden SaveButton - controlled by menu */}
      <Box sx={{ display: 'none' }}>
        <SaveButton
          nodes={nodes}
          edges={edges}
          templateInfo={templateInfo}
          currentOrchestratorId={currentOrchestratorId}
          onSaveSuccess={onSaveSuccess}
          disabled={!canSave}
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
        />
      </Box>

      {/* Hidden DeleteButton - controlled by menu */}
      <Box sx={{ display: 'none' }}>
        <DeleteButton
          currentOrchestratorId={currentOrchestratorId}
          orchestratorName={orchestratorName}
          disabled={!canDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      </Box>
    </>
  );
};
