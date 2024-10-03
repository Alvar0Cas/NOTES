import React, { useReducer, useState } from 'react';
import './App.css';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountCircle,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Draggable from 'react-draggable';

interface Note {
  id: number;
  title: string;
  content: string;
  bgColor: string;
  position: { x: number; y: number };
  isDragging?: boolean;
}

interface NotesState {
  notes: Note[];
}

type NotesAction =
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'EDIT_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: number }
  | { type: 'UPDATE_NOTE_POSITION'; payload: { id: number; position: { x: number; y: number } } }
  | { type: 'SET_DRAGGING'; payload: { id: number; isDragging: boolean } };

const initialNotesState: NotesState = {
  notes: [],
};

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'ADD_NOTE':
      return {
        ...state,
        notes: [...state.notes, action.payload],
      };
    case 'EDIT_NOTE':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
      };
    case 'UPDATE_NOTE_POSITION':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id
            ? { ...note, position: action.payload.position }
            : note
        ),
      };
    case 'SET_DRAGGING':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id
            ? { ...note, isDragging: action.payload.isDragging }
            : note
        ),
      };
    default:
      return state;
  }
}

const NotesContext = React.createContext<{
  state: NotesState;
  dispatch: React.Dispatch<NotesAction>;
} | undefined>(undefined);

function App() {
  const [state, dispatch] = useReducer(notesReducer, initialNotesState);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNote = () => {
    if (editMode && currentNote) {
      dispatch({
        type: 'EDIT_NOTE',
        payload: { ...currentNote, title: newNote.title, content: newNote.content },
      });
      setEditMode(false);
      setCurrentNote(null);
    } else {
      const noteExists = state.notes.some(
        (note) =>
          note.title === newNote.title && note.content === newNote.content
      );

      if (!noteExists) {
        dispatch({
          type: 'ADD_NOTE',
          payload: {
            ...newNote,
            id: Date.now(),
            bgColor: getRandomColor(),
            position: { x: 0, y: 0 },
            isDragging: false,
          },
        });
      } else {
        alert('La nota ya existe.');
      }
    }
    setNewNote({ title: '', content: '' });
    setOpenModal(false);
  };

  const handleDeleteNote = (id: number) => {
    dispatch({ type: 'DELETE_NOTE', payload: id });
  };

  const handleEditNote = (note: Note) => {
    setEditMode(true);
    setCurrentNote(note);
    setNewNote({ title: note.title, content: note.content });
    setOpenModal(true);
  };

  const getRandomColor = () => {
    const colors = ['#FFB6C1', '#B0E0E6', '#FFFACD', '#E6E6FA', '#F0FFF0'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleDragStart = (id: number) => {
    dispatch({ type: 'SET_DRAGGING', payload: { id, isDragging: true } });
  };

  const handleDragStop = (e: any, data: any, note: Note) => {
    const draggedPosition = { x: data.x, y: data.y };

    dispatch({
      type: 'UPDATE_NOTE_POSITION',
      payload: { id: note.id, position: draggedPosition },
    });

    dispatch({ type: 'SET_DRAGGING', payload: { id: note.id, isDragging: false } });
  };

  return (
    <NotesContext.Provider value={{ state, dispatch }}>
      <div className="App">
        <AppBar position="fixed" className="app-bar">
          <Toolbar>
            <Typography variant="h6" className="app-title" noWrap>
              Notes App
            </Typography>
            <div className="search">
              <InputBase
                placeholder="Buscar…"
                classes={{ root: 'input-root', input: 'input-input' }}
                inputProps={{ 'aria-label': 'buscar' }}
              />
              <div className="search-icon">
                <SearchIcon />
              </div>
            </div>
            <div className="grow" />
            <div className="section-right">
              <IconButton edge="end" color="inherit">
                <AccountCircle />
              </IconButton>
              <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
                <MoreIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Opciones</MenuItem>
                <MenuItem onClick={() => setOpenModal(true)}>Agregar Nota</MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>

        <div className="notes-container">
          {state.notes.map((note) => (
            <Draggable
              key={note.id}
              position={note.position}
              onStart={() => handleDragStart(note.id)}
              onStop={(e, data) => handleDragStop(e, data, note)}
            >
              <div
                className="note"
                style={{
                  backgroundColor: note.bgColor,
                  zIndex: note.isDragging ? 10 : 1,
                }}
              >
                <div className="note-header">
                  <IconButton onClick={() => handleEditNote(note)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteNote(note.id)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
                <h3>{note.title}</h3>
                <p>{note.content}</p>
              </div>
            </Draggable>
          ))}
        </div>

        <IconButton 
          className="add-note-button" 
          onClick={() => setOpenModal(true)} 
          color="primary"
        >
          <AddIcon fontSize="large" />
        </IconButton>

        <Dialog open={openModal} onClose={() => setOpenModal(false)}>
          <DialogTitle>{editMode ? 'Editar Nota' : 'Agregar Nota'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Título"
              type="text"
              fullWidth
              variant="outlined"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Contenido"
              type="text"
              fullWidth
              variant="outlined"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
            <Button onClick={handleAddNote}>{editMode ? 'Guardar' : 'Crear'}</Button>
          </DialogActions>
        </Dialog>
      </div>
    </NotesContext.Provider>
  );
}

export default App;
