"use client"

import { useState, useEffect, useRef, useMemo } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  DecoupledEditor,
  Autosave,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Heading,
  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,
  Alignment,
  List,
  Link,
  Image,
  ImageUpload,
  ImageResize,
  Table,
  TableToolbar,
  BlockQuote,
  Indent,
  IndentBlock,
  FindAndReplace,
  HorizontalLine,
  MediaEmbed,
  RemoveFormat,
  Strikethrough,
  Subscript,
  Superscript,
  Code,
  CodeBlock,
  Bookmark,
  Highlight,
  SpecialCharacters,
  SpecialCharactersEssentials,
  TodoList,
  Emoji,
  PasteFromOffice,
  AutoLink,
  AutoImage,
  TextTransformation,
  LineHeight
} from 'ckeditor5'

import 'ckeditor5/ckeditor5.css'

interface CKEditorWrapperProps {
  initialContent: string
  onUpdate: (content: string) => void
}

export function CKEditorWrapper({ initialContent, onUpdate }: CKEditorWrapperProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorToolbarRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [isLayoutReady, setIsLayoutReady] = useState(false)

  useEffect(() => {
    setIsLayoutReady(true)
    return () => setIsLayoutReady(false)
  }, [])

  const editorConfig = useMemo(() => {
    if (!isLayoutReady) return null

    return {
      toolbar: {
        items: [
          'undo', 'redo', '|',
          'heading', '|',
          'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
          'bold', 'italic', 'underline', 'strikethrough', '|',
          'alignment', 'lineHeight', '|',
          'bulletedList', 'numberedList', 'todoList', '|',
          'link', 'insertImage', 'insertTable', 'blockQuote', '|',
          'findAndReplace', 'removeFormat'
        ],
        shouldNotGroupWhenFull: false
      },
      plugins: [
        Essentials,
        Paragraph,
        Bold,
        Italic,
        Underline,
        Heading,
        FontSize,
        FontFamily,
        FontColor,
        FontBackgroundColor,
        Alignment,
        List,
        TodoList,
        Link,
        AutoLink,
        Image,
        AutoImage,
        ImageUpload,
        ImageResize,
        Table,
        TableToolbar,
        BlockQuote,
        Indent,
        IndentBlock,
        FindAndReplace,
        HorizontalLine,
        RemoveFormat,
        Strikethrough,
        Subscript,
        Superscript,
        Code,
        CodeBlock,
        Highlight,
        SpecialCharacters,
        SpecialCharactersEssentials,
        Emoji,
        PasteFromOffice,
        TextTransformation,
        LineHeight,
        Autosave
      ],
      fontFamily: {
        supportAllValues: true,
        options: [
          'default',
          'Arial, Helvetica, sans-serif',
          'Courier New, Courier, monospace',
          'Georgia, serif',
          'Lucida Sans Unicode, Lucida Grande, sans-serif',
          'Tahoma, Geneva, sans-serif',
          'Times New Roman, Times, serif',
          'Trebuchet MS, Helvetica, sans-serif',
          'Verdana, Geneva, sans-serif'
        ]
      },
      fontSize: {
        options: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36],
        supportAllValues: true
      },
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
        ]
      },
      image: {
        toolbar: [
          'imageTextAlternative', '|',
          'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|',
          'resizeImage'
        ]
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
      },
      lineHeight: {
        options: [1, 1.15, 1.5, 2, 2.5, 3]
      },
      placeholder: 'Type your content here...',
      initialData: initialContent,
      autosave: {
        waitingTime: 1000,
        save(editor: any) {
          return new Promise((resolve) => {
            onUpdate(editor.getData())
            resolve(undefined)
          })
        }
      },
      licenseKey: 'GPL'
    }
  }, [isLayoutReady, initialContent, onUpdate])

  if (!isLayoutReady || !editorConfig) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="editor-container" ref={editorContainerRef}>
      <div className="editor-toolbar border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" ref={editorToolbarRef}></div>
      <div ref={editorRef}>
        <CKEditor
          editor={DecoupledEditor}
          config={editorConfig}
          onReady={(editor: any) => {
            if (editorToolbarRef.current) {
              editorToolbarRef.current.appendChild(editor.ui.view.toolbar.element)
            }
          }}
          onAfterDestroy={() => {
            if (editorToolbarRef.current) {
              Array.from(editorToolbarRef.current.children).forEach(child => child.remove())
            }
          }}
        />
      </div>
    </div>
  )
}
