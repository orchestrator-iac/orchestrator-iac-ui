import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Box, IconButton, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TitleIcon from '@mui/icons-material/Title';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import HighlightIcon from '@mui/icons-material/Highlight';
import LinkIcon from '@mui/icons-material/Link';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';

interface RichNoteEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
  placeholder?: string;
  advanced?: boolean;
  compact?: boolean;
}

const RichNoteEditor: React.FC<RichNoteEditorProps> = ({ value, onChange, minHeight = 120, placeholder, advanced = false, compact = false }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] })
    ],
    content: value || '',
    editorProps: {
      attributes: {
        style: `min-height:${minHeight}px; padding:8px 12px; outline:none; font-size:${compact ? '0.85rem' : '0.95rem'};`,
        class: 'note-rich-editor'
      }
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML())
  });

  useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value || '', false); }, [value, editor]);
  if (!editor) return null;

  const headingBtn = (lvl: 1|2|3) => (
    <Tooltip title={`H${lvl}`}><span><IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: lvl }).run()} color={editor.isActive('heading', { level: lvl }) ? 'primary' : 'default'}><TitleIcon fontSize="inherit" sx={{ fontSize: 16 }} /></IconButton></span></Tooltip>
  );

  const toggleLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', prev || 'https://');
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const baseButtons = (
    <>
      <Tooltip title="Bold"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}><FormatBoldIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Italic"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}><FormatItalicIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Underline"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive('underline') ? 'primary' : 'default'}><FormatUnderlinedIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Strike"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleStrike().run()} color={editor.isActive('strike') ? 'primary' : 'default'}><StrikethroughSIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Bullet List"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? 'primary' : 'default'}><FormatListBulletedIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Numbered List"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive('orderedList') ? 'primary' : 'default'}><FormatListNumberedIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Quote"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive('blockquote') ? 'primary' : 'default'}><FormatQuoteIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Code Block"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive('codeBlock') ? 'primary' : 'default'}><CodeIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Highlight"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleHighlight().run()} color={editor.isActive('highlight') ? 'primary' : 'default'}><HighlightIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Link"><span><IconButton size="small" onClick={toggleLink} color={editor.isActive('link') ? 'primary' : 'default'}><LinkIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Align Left"><span><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('left').run()} color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}><FormatAlignLeftIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Align Center"><span><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('center').run()} color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}><FormatAlignCenterIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Align Right"><span><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('right').run()} color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}><FormatAlignRightIcon fontSize="inherit" /></IconButton></span></Tooltip>
    </>
  );

  const advButtons = advanced ? (
    <>
      {headingBtn(1)}{headingBtn(2)}{headingBtn(3)}
      <Tooltip title="Undo"><span><IconButton size="small" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><UndoIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Redo"><span><IconButton size="small" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><RedoIcon fontSize="inherit" /></IconButton></span></Tooltip>
      <Tooltip title="Clear"><span><IconButton size="small" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}><CleaningServicesIcon fontSize="inherit" /></IconButton></span></Tooltip>
    </>
  ) : null;

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', background: 'background.paper' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, p: 0.5, borderBottom: '1px solid', borderColor: 'divider', background: 'background.paper' }}>
        {baseButtons}
        {advButtons}
      </Box>
      <EditorContent editor={editor} />
      {placeholder && !value && <Box sx={{ position: 'absolute', pointerEvents: 'none', opacity: 0.4, top: 46, left: 16 }}>{placeholder}</Box>}
    </Box>
  );
};

export default RichNoteEditor;
