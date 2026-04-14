import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

export type MarkdownDisplayProps = {
  children: string
  disableLinks?: boolean
}

const FRONTMATTER_PATTERN = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n)?/

const stripLeadingFrontmatter = (markdown: string) => {
  return markdown.replace(FRONTMATTER_PATTERN, '')
}

export const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({
  children,
  disableLinks = false,
}) => {
  const markdown = stripLeadingFrontmatter(children)

  return (
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
      {markdown}
    </ReactMarkdown>
  )
}
