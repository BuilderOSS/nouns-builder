import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

export type MarkdownDisplayProps = {
  children: string
  disableLinks?: boolean
}

export const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({
  children,
  disableLinks = false,
}) => {
  return (
    <div className="markdown-display-wrapper">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
        components={
          disableLinks
            ? {
                a: (props) => <span>{props.children}</span>,
              }
            : undefined
        }
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
