import { isNormalizeableIPFSUrl } from '@buildeross/ipfs-service'
import React, { useMemo } from 'react'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

import { FallbackImage } from '../FallbackImage'

const markdownSanitizeSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src ?? []), 'ipfs'],
  },
}

export type MarkdownDisplayProps = {
  children: string
  disableLinks?: boolean
}

export const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({
  children,
  disableLinks = false,
}) => {
  const components = useMemo(
    () => ({
      ...(disableLinks
        ? {
            a: (props: { children?: React.ReactNode }) => <span>{props.children}</span>,
          }
        : {}),
      img: ({
        node: _node,
        src,
        ...props
      }: React.ComponentPropsWithoutRef<'img'> & {
        node?: unknown
      }) =>
        isNormalizeableIPFSUrl(src) ? (
          <FallbackImage src={src} {...props} />
        ) : (
          <img alt={props.alt ?? ''} src={src} {...props} />
        ),
    }),
    [disableLinks]
  )

  return (
    <div className="markdown-display-wrapper">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSanitizeSchema]]}
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) =>
          isNormalizeableIPFSUrl(url) ? url : defaultUrlTransform(url)
        }
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
