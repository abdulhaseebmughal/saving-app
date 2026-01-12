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
  Highlight,
  SpecialCharacters,
  SpecialCharactersEssentials,
  TodoList,
  PasteFromOffice,
  AutoLink,
  AutoImage,
  TextTransformation
} from 'ckeditor5'

import 'ckeditor5/ckeditor5.css'
import { ArrowLeft, Plus, Trash2, Printer, Download, FileText } from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

interface Page {
  id: string
  content: string
}

interface WordEditorProps {
  documentId: string
  initialTitle: string
  initialContent: string
  onUpdate: (title: string, content: string) => void
}

export function WordEditor({ documentId, initialTitle, initialContent, onUpdate }: WordEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [pages, setPages] = useState<Page[]>([{ id: 'page-1', content: initialContent || '' }])
  const [activePage, setActivePage] = useState('page-1')
  const [isLayoutReady, setIsLayoutReady] = useState(false)
  const editorToolbarRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)
  const pageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    setIsLayoutReady(true)
    return () => setIsLayoutReady(false)
  }, [])

  // Parse initial content into pages
  useEffect(() => {
    if (initialContent && initialContent.includes('<div class="page-break"></div>')) {
      const pageSections = initialContent.split('<div class="page-break"></div>')
      const parsedPages = pageSections.map((content, index) => ({
        id: `page-${index + 1}`,
        content: content.trim()
      })).filter(page => page.content)

      if (parsedPages.length > 0) {
        setPages(parsedPages)
        setActivePage(parsedPages[0].id)
      }
    }
  }, [initialContent])

  const editorConfig = useMemo(() => {
    if (!isLayoutReady) return null

    return {
      toolbar: {
        items: [
          'undo', 'redo', '|',
          'heading', '|',
          'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
          'bold', 'italic', 'underline', 'strikethrough', '|',
          'alignment', '|',
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
        PasteFromOffice,
        TextTransformation,
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
        ],
        upload: {
          types: ['jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff']
        }
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
      },
      placeholder: 'Type your content here...',
      initialData: pages.find(p => p.id === activePage)?.content || '',
      autosave: {
        waitingTime: 1000,
        save(editor: any) {
          return new Promise((resolve) => {
            handleEditorUpdate(editor)
            resolve(undefined)
          })
        }
      },
      licenseKey: 'GPL'
    }
  }, [isLayoutReady, activePage])

  const handleEditorUpdate = (editor: any) => {
    const content = editor.getData()

    // Update the active page content
    setPages(prevPages => {
      const updatedPages = prevPages.map(page =>
        page.id === activePage ? { ...page, content } : page
      )

      // Combine all pages with page breaks
      const combinedContent = updatedPages.map(p => p.content).join('<div class="page-break"></div>')
      onUpdate(title, combinedContent)

      return updatedPages
    })
  }

  const addBlankPage = () => {
    const newPageNumber = pages.length + 1
    const newPageId = `page-${newPageNumber}`
    const newPage: Page = { id: newPageId, content: '' }

    setPages(prev => [...prev, newPage])
    setActivePage(newPageId)

    // Clear editor for new page
    if (editorRef.current) {
      editorRef.current.setData('')
    }
  }

  const deletePage = (pageId: string) => {
    if (pages.length === 1) {
      alert('Cannot delete the last page')
      return
    }

    const pageIndex = pages.findIndex(p => p.id === pageId)
    const updatedPages = pages.filter(p => p.id !== pageId)
    setPages(updatedPages)

    // Switch to previous page or first page
    if (activePage === pageId) {
      const newActivePage = updatedPages[Math.max(0, pageIndex - 1)]
      setActivePage(newActivePage.id)
      if (editorRef.current) {
        editorRef.current.setData(newActivePage.content)
      }
    }

    // Update document
    const combinedContent = updatedPages.map(p => p.content).join('<div class="page-break"></div>')
    onUpdate(title, combinedContent)
  }

  const switchPage = (pageId: string) => {
    if (pageId === activePage) return

    const page = pages.find(p => p.id === pageId)
    if (!page) return

    setActivePage(pageId)
    if (editorRef.current) {
      editorRef.current.setData(page.content)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    const combinedContent = pages.map(p => p.content).join('<div class="page-break"></div>')
    onUpdate(newTitle, combinedContent)
  }

  const handlePrint = () => {
    // Create print-friendly view
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || 'Document'}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            @media print {
              body { margin: 0; padding: 0; }
              .page { page-break-after: always; }
              .page:last-child { page-break-after: auto; }
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              background: white;
              margin: 0 auto;
            }
            h1 { font-size: 24pt; margin: 0 0 12pt; }
            h2 { font-size: 18pt; margin: 0 0 10pt; }
            h3 { font-size: 14pt; margin: 0 0 8pt; }
            p { margin: 0 0 12pt; }
            table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
            td, th { border: 1px solid #000; padding: 8px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 20pt;">${title}</h1>
          ${pages.map(p => `<div class="page">${p.content}</div>`).join('')}
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const exportToPDF = () => {
    // Use browser's print to PDF feature for best results
    alert('To export as PDF:\n\n1. Click the Print button (printer icon)\n2. In the print dialog, select "Save as PDF" or "Microsoft Print to PDF"\n3. Click Save\n\nThis method provides the best quality and formatting.')
  }

  const exportToWord = () => {
    // Simple Word export using HTML blob
    const combinedHTML = pages.map(p => p.content).join('<div style="page-break-after: always;"></div>')
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
        </head>
        <body>
          <h1>${title}</h1>
          ${combinedHTML}
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title || 'document'}.doc`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!isLayoutReady || !editorConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-end mb-3 gap-2">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-50 rounded transition-colors"
              title="Print"
            >
              <Printer className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={exportToPDF}
              className="p-2 hover:bg-gray-50 rounded transition-colors"
              title="Export to PDF"
            >
              <Download className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={exportToWord}
              className="p-2 hover:bg-gray-50 rounded transition-colors"
              title="Export to Word"
            >
              <FileText className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="w-full text-2xl font-normal bg-transparent border-none outline-none text-gray-900 mb-3"
            placeholder="Untitled Document"
          />

          {/* Toolbar */}
          <div className="editor-toolbar border-t border-gray-100 pt-3" ref={editorToolbarRef}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="w-48 bg-white border-r border-gray-100 p-4 min-h-screen">
          <h3 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Pages</h3>

          <div className="space-y-1">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`group relative p-2 rounded cursor-pointer transition-all ${
                  activePage === page.id
                    ? 'bg-gray-100 border border-gray-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => switchPage(page.id)}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    activePage === page.id
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500'
                  }`}>
                    Page {index + 1}
                  </span>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePage(page.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
                      title="Delete page"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addBlankPage}
            className="w-full mt-4 flex items-center justify-center gap-2 p-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Page</span>
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-[210mm] mx-auto space-y-6">
            {pages.map((page) => (
              <div
                key={page.id}
                ref={(el) => { pageRefs.current[page.id] = el }}
                className={`bg-white shadow-sm transition-all ${
                  activePage === page.id ? 'ring-2 ring-gray-200' : ''
                }`}
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '20mm',
                  margin: '0 auto'
                }}
                onClick={() => switchPage(page.id)}
              >
                {activePage === page.id ? (
                  <CKEditor
                    editor={DecoupledEditor}
                    config={editorConfig}
                    onReady={(editor: any) => {
                      editorRef.current = editor
                      if (editorToolbarRef.current) {
                        editorToolbarRef.current.appendChild(editor.ui.view.toolbar.element)
                      }

                      // Simple base64 upload adapter
                      editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
                        return {
                          upload: () => {
                            return loader.file.then((file: File) => {
                              return new Promise((resolve) => {
                                const reader = new FileReader()
                                reader.onload = () => {
                                  resolve({ default: reader.result })
                                }
                                reader.readAsDataURL(file)
                              })
                            })
                          },
                          abort: () => {}
                        }
                      }
                    }}
                    onAfterDestroy={() => {
                      if (editorToolbarRef.current) {
                        Array.from(editorToolbarRef.current.children).forEach(child => child.remove())
                      }
                    }}
                  />
                ) : (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.content || '<p class="text-gray-300">Empty page</p>' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
