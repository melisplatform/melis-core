/**
 * RichEditor — wraps TipTap or TinyMCE depending on the `engine` prop.
 * Default: TipTap (open-source, React-native).
 * Switch to TinyMCE: <RichEditor engine="tinymce" ... />
 *
 * TinyMCE requires either:
 *   - A TINYMCE_API_KEY env var for cloud delivery, OR
 *   - Self-hosted: copy /node_modules/tinymce to /public/tinymce and pass
 *     tinymceScriptSrc="/tinymce/tinymce.min.js" prop.
 */
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { Editor as TiptapEditor } from '@tiptap/core'
import { Editor as TinyMCEReact } from '@tinymce/tinymce-react'
import { useRef } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, List, ListOrdered, Heading2, Heading3,
  RemoveFormatting,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RichEditorEngine = 'tiptap' | 'tinymce'

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  engine?: RichEditorEngine
  minRows?: number
  className?: string
}

// ─── TipTap toolbar button ────────────────────────────────────────────────────

function ToolbarBtn({
  active, onClick, title, children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={cn(
        'flex size-7 items-center justify-center rounded transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

// ─── TipTap toolbar ───────────────────────────────────────────────────────────

function TiptapToolbar({ editor }: { editor: TiptapEditor }) {
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string ?? ''
    const url = window.prompt('URL', prev)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
      {/* Headings */}
      <ToolbarBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
        <Heading2 className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
        <Heading3 className="size-3.5" />
      </ToolbarBtn>

      <div className="mx-1 h-4 w-px bg-border" />

      {/* Inline marks */}
      <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
        <Bold className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
        <Italic className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
        <UnderlineIcon className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
        <Strikethrough className="size-3.5" />
      </ToolbarBtn>

      <div className="mx-1 h-4 w-px bg-border" />

      {/* Alignment */}
      <ToolbarBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align left">
        <AlignLeft className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Center">
        <AlignCenter className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align right">
        <AlignRight className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify">
        <AlignJustify className="size-3.5" />
      </ToolbarBtn>

      <div className="mx-1 h-4 w-px bg-border" />

      {/* Lists */}
      <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
        <List className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
        <ListOrdered className="size-3.5" />
      </ToolbarBtn>

      <div className="mx-1 h-4 w-px bg-border" />

      {/* Link */}
      <ToolbarBtn active={editor.isActive('link')} onClick={setLink} title="Link">
        <LinkIcon className="size-3.5" />
      </ToolbarBtn>

      {/* Clear formatting */}
      <ToolbarBtn active={false} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
        <RemoveFormatting className="size-3.5" />
      </ToolbarBtn>
    </div>
  )
}

// ─── TipTap editor ────────────────────────────────────────────────────────────

function TiptapEditor_({ value, onChange, placeholder, minRows = 6, className }: Omit<RichEditorProps, 'engine'>) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write your content here…' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none px-4 py-3 text-foreground',
          `min-h-[${minRows * 1.6}rem]`,
        ),
      },
    },
  })

  if (!editor) return null

  return (
    <div className={cn('rounded-xl border border-border bg-card focus-within:border-ring/40 focus-within:shadow-sm transition-shadow', className)}>
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

// ─── TinyMCE editor ───────────────────────────────────────────────────────────

function TinymceEditor_({ value, onChange, placeholder, minRows = 6, className }: Omit<RichEditorProps, 'engine'>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tinyRef = useRef<any>(null)

  return (
    <div className={cn('rounded-xl border border-border overflow-hidden', className)}>
      <TinyMCEReact
        onInit={(_, editor) => { tinyRef.current = editor }}
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height: minRows * 32,
          menubar: false,
          plugins: ['lists', 'link', 'autolink', 'wordcount'],
          toolbar:
            'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist | link | removeformat',
          placeholder: placeholder ?? 'Write your content here…',
          skin: 'oxide',
          content_css: 'default',
          branding: false,
          statusbar: true,
          resize: true,
        }}
      />
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export function RichEditor({ engine = 'tiptap', ...props }: RichEditorProps) {
  if (engine === 'tinymce') {
    return <TinymceEditor_ {...props} />
  }
  return <TiptapEditor_ {...props} />
}
