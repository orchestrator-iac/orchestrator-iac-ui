import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  notesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  },
  noteCard: {
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
  },
  addNoteForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  inputField: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  submitButton: {
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

export default useStyles;