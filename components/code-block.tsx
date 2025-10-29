interface CodeBlockProps {
  code: string
  language?: string
  maxHeight?: string
}

export function CodeBlock({ code, language = "typescript", maxHeight = "150px" }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-[oklch(0.205_0_0)]">
      <pre className="overflow-auto p-3 text-xs leading-relaxed" style={{ maxHeight }}>
        <code className="font-mono text-[oklch(0.85_0_0)]">{code}</code>
      </pre>
    </div>
  )
}
