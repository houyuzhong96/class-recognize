import { useRef, useState, type ReactNode } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Mathematics from '@tiptap/extension-mathematics'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Heading2,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Sigma,
  X,
} from 'lucide-react'
import katex from 'katex'
import { compressImageFile } from '../domain/image'
import { sanitizeRichText } from '../domain/richText'

interface RichTextEditorProps {
  label: string
  value: string
  placeholder: string
  onChange(value: string): void
}

type FormulaMode = 'inline' | 'block'

interface FormulaDialogState {
  latex: string
  mode: FormulaMode
  pos?: number
}

function ToolbarButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick(): void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={`editor-tool${active ? ' editor-tool--active' : ''}`}
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function formatFormulaPreview(latex: string, mode: FormulaMode) {
  if (!latex.trim()) return '<span class="formula-empty">输入 LaTeX 公式</span>'

  try {
    return katex.renderToString(latex, {
      displayMode: mode === 'block',
      throwOnError: true,
      trust: false,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '公式格式有误'
    return `<span class="formula-error">${message}</span>`
  }
}

function editorWithFormulaHandlers(
  onFormulaClick: (latex: string, pos: number, mode: FormulaMode) => void,
) {
  return Mathematics.configure({
    katexOptions: { throwOnError: false, trust: false },
    inlineOptions: {
      onClick: (node, pos) =>
        onFormulaClick(String(node.attrs.latex ?? ''), pos, 'inline'),
    },
    blockOptions: {
      onClick: (node, pos) =>
        onFormulaClick(String(node.attrs.latex ?? ''), pos, 'block'),
    },
  })
}

export function RichTextEditor({
  label,
  value,
  placeholder,
  onChange,
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [formulaDialog, setFormulaDialog] = useState<FormulaDialogState>()
  const [mediaMessage, setMediaMessage] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: { class: 'lesson-image' },
      }),
      Placeholder.configure({ placeholder }),
      editorWithFormulaHandlers((latex, pos, mode) =>
        setFormulaDialog({ latex, pos, mode }),
      ),
    ],
    content: sanitizeRichText(value) || '<p></p>',
    editorProps: {
      attributes: {
        'aria-label': label,
        'aria-multiline': 'true',
        role: 'textbox',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML())
    },
  })

  async function insertImage(file: File) {
    if (!editor) return
    setMediaMessage('正在压缩图片...')

    try {
      const source = await compressImageFile(file)
      editor
        .chain()
        .focus()
        .setImage({ src: source, alt: file.name })
        .run()
      setMediaMessage('')
    } catch (error) {
      setMediaMessage(error instanceof Error ? error.message : '插入图片失败')
    }
  }

  function insertFormula() {
    if (!editor || !formulaDialog?.latex.trim()) return

    if (formulaDialog.mode === 'inline') {
      const chain = editor.chain().focus()
      const command =
        formulaDialog.pos === undefined
          ? chain.insertInlineMath({ latex: formulaDialog.latex })
          : chain.updateInlineMath({
              latex: formulaDialog.latex,
              pos: formulaDialog.pos,
            })
      command.run()
    } else {
      const chain = editor.chain().focus()
      const command =
        formulaDialog.pos === undefined
          ? chain.insertBlockMath({ latex: formulaDialog.latex })
          : chain.updateBlockMath({
              latex: formulaDialog.latex,
              pos: formulaDialog.pos,
            })
      command.run()
    }

    setFormulaDialog(undefined)
  }

  return (
    <section className="rich-field" aria-label={`${label}内容`}>
      <div className="rich-field__label">
        <span>{label}</span>
        <span>支持图片与公式</span>
      </div>

      <div className="rich-editor">
        <div className="rich-editor__toolbar" aria-label={`${label}编辑工具`}>
          <ToolbarButton
            label="加粗"
            active={editor?.isActive('bold')}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold aria-hidden="true" size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="斜体"
            active={editor?.isActive('italic')}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic aria-hidden="true" size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="小标题"
            active={editor?.isActive('heading', { level: 2 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 aria-hidden="true" size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="无序列表"
            active={editor?.isActive('bulletList')}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List aria-hidden="true" size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="有序列表"
            active={editor?.isActive('orderedList')}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered aria-hidden="true" size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="插入公式"
            onClick={() =>
              setFormulaDialog({ latex: '', mode: 'inline' })
            }
          >
            <Sigma aria-hidden="true" size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="插入图片"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImagePlus aria-hidden="true" size={18} />
          </ToolbarButton>
        </div>

        <EditorContent
          editor={editor}
          className="rich-editor__content"
        />
        <input
          ref={imageInputRef}
          className="visually-hidden"
          type="file"
          accept="image/*"
          aria-label={`${label}插入图片文件`}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void insertImage(file)
            event.target.value = ''
          }}
        />
      </div>

      {mediaMessage ? (
        <p className="rich-field__message">{mediaMessage}</p>
      ) : null}

      {formulaDialog ? (
        <div className="formula-dialog" role="dialog" aria-label="编辑公式">
          <div className="formula-dialog__header">
            <strong>编辑公式</strong>
            <button
              type="button"
              className="icon-button"
              aria-label="关闭公式编辑"
              onClick={() => setFormulaDialog(undefined)}
            >
              <X aria-hidden="true" size={17} />
            </button>
          </div>

          <div className="formula-mode" aria-label="公式位置">
            <button
              type="button"
              className={
                formulaDialog.mode === 'inline'
                  ? 'formula-mode__item formula-mode__item--active'
                  : 'formula-mode__item'
              }
              onClick={() =>
                setFormulaDialog((current) =>
                  current ? { ...current, mode: 'inline' } : current,
                )
              }
            >
              行内公式
            </button>
            <button
              type="button"
              className={
                formulaDialog.mode === 'block'
                  ? 'formula-mode__item formula-mode__item--active'
                  : 'formula-mode__item'
              }
              onClick={() =>
                setFormulaDialog((current) =>
                  current ? { ...current, mode: 'block' } : current,
                )
              }
            >
              独立公式
            </button>
          </div>

          <label className="field">
            <span>LaTeX</span>
            <textarea
              value={formulaDialog.latex}
              rows={3}
              autoFocus
              placeholder="例如：x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"
              onChange={(event) =>
                setFormulaDialog((current) =>
                  current
                    ? { ...current, latex: event.target.value }
                    : current,
                )
              }
            />
          </label>

          <div
            className="formula-preview"
            dangerouslySetInnerHTML={{
              __html: formatFormulaPreview(
                formulaDialog.latex,
                formulaDialog.mode,
              ),
            }}
          />

          <div className="formula-dialog__actions">
            <button
              type="button"
              className="button button--primary"
              disabled={!formulaDialog.latex.trim()}
              onClick={insertFormula}
            >
              插入公式
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
