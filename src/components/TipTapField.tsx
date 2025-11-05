import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { useRef } from "react";
import StarterKit from "@tiptap/starter-kit";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import DataObjectIcon from "@mui/icons-material/DataObject"; // code block
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import CodeIcon from "@mui/icons-material/Code";

export default function TipTapField({
  name,
  label,
  defaultValue,
  ariaLabel,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  ariaLabel?: string;
}) {
  const hiddenRef = React.useRef<HTMLInputElement>(null);
  const [html, setHtml] = React.useState<string>(defaultValue ?? "");

  const editor = useEditor({
    extensions: [
      StarterKit, // includes bold, italic, code, codeBlock, lists, blockquote, hr, hardBreak, history
    ],
    content: defaultValue || "",
    onCreate: ({ editor }) => {
      const val = editor.getHTML();
      setHtml(val);
      if (hiddenRef.current) hiddenRef.current.value = val;
    },
    onUpdate: ({ editor }) => {
      const val = editor.getHTML();
      setHtml(val);
      if (hiddenRef.current) hiddenRef.current.value = val;
    },
  });

  React.useEffect(() => {
    if (editor && defaultValue !== undefined) {
      editor.commands.setContent(defaultValue);
    }
  }, [defaultValue, editor]);

  if (!editor) return null;

  return (
    <Box>
      <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary" }}>
        {label}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
        <Tooltip title="Negrito">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            color={editor.isActive("bold") ? "primary" : "default"}
          >
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Itálico">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            color={editor.isActive("italic") ? "primary" : "default"}
          >
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Código inline">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleCode().run()}
            color={editor.isActive("code") ? "primary" : "default"}
          >
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Bloco de código">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            color={editor.isActive("codeBlock") ? "primary" : "default"}
          >
            <DataObjectIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Citação">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            color={editor.isActive("blockquote") ? "primary" : "default"}
          >
            <FormatQuoteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Lista com marcadores">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            color={editor.isActive("bulletList") ? "primary" : "default"}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Lista numerada">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            color={editor.isActive("orderedList") ? "primary" : "default"}
          >
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Linha horizontal">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <HorizontalRuleIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Quebra de linha (Shift+Enter)">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setHardBreak().run()}
          >
            <KeyboardReturnIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Desfazer">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refazer">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <RedoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Limpar formatação">
          <IconButton
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          >
            <FormatClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box
        sx={{
          border: "1px solid rgba(0,0,0,0.23)",
          borderRadius: 1,
          backgroundColor: "#fff",
          overflow: "hidden",
          "&:hover": { borderColor: "rgba(0,0,0,0.87)" },
          "&.focused": {
            borderColor: "primary.main",
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}22`,
          },
        }}
        onFocus={(e) => e.currentTarget.classList.add("focused")}
        onBlur={(e) => e.currentTarget.classList.remove("focused")}
      >
        <EditorContent
          editor={editor}
          aria-label={ariaLabel}
          className="tiptap-container"
        />
      </Box>

      <style>{`
        .tiptap-container .ProseMirror {
          min-height: 160px;
          padding: 12px;
          outline: none;
          cursor: text;
          background: transparent;
        }
        .tiptap-container .ProseMirror p { margin: 0 0 0.5rem; }
        .tiptap-container .ProseMirror code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          background: rgba(0,0,0,0.06);
          border-radius: 6px;
          padding: 0.08rem 0.35rem;
        }
        .tiptap-container .ProseMirror blockquote {
          border-left: 3px solid #ccc;
          margin: .4rem 0;
          padding: .2rem .8rem;
          color: #555;
        }
        .tiptap-container .ProseMirror pre {
          background: #f5f5f5;
          padding: .6rem .8rem;
          border-radius: 8px;
          overflow: auto;
        }
        .tiptap-container .ProseMirror ul,
        .tiptap-container .ProseMirror ol { padding-left: 1.25rem; }
      `}</style>

      <input ref={hiddenRef} type="hidden" name={name} value={html} />
    </Box>
  );
}