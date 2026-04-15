import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { Box, Button, Flex } from '@buildeross/zord'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { daoDescription, fadingEffect, UNEXPANDED_BOX_HEIGHT } from './mdRender.css'

const FRONTMATTER_PATTERN = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n)?/

const stripLeadingFrontmatter = (markdown: string): string => {
  return markdown.replace(FRONTMATTER_PATTERN, '')
}

export const DaoDescription = ({ description }: { description?: string }) => {
  const [isOverHeight, setIsOverHeight] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const descriptionContentId = useId()

  const correctedDescription = useMemo(() => {
    if (typeof description === 'string') {
      // Text processing on the backend (possibly subgraph) will sometimes replace
      // \n with \\n, which will break markdown.
      // This effect is intermittent, so this catches any instance where it happens
      return description.trim().replace(/\\n/g, '\n').replace(/\\r/g, '\r')
    }
    return ''
  }, [description])

  const displayDescription = useMemo(() => {
    return stripLeadingFrontmatter(correctedDescription)
  }, [correctedDescription])

  const collapsedHeight = useMemo(() => {
    return Number.parseInt(UNEXPANDED_BOX_HEIGHT, 10)
  }, [])

  const updateOverflowState = useCallback(() => {
    const contentHeight = containerRef.current?.scrollHeight || 0
    setIsOverHeight(contentHeight > collapsedHeight)
  }, [collapsedHeight])

  useEffect(() => {
    setIsExpanded(false)
  }, [displayDescription])

  useEffect(() => {
    updateOverflowState()

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateOverflowState()
      })

      if (containerRef.current) observer.observe(containerRef.current)
    }

    window.addEventListener('resize', updateOverflowState)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateOverflowState)
    }
  }, [displayDescription, updateOverflowState])

  if (!displayDescription.trim()) return null

  return (
    <Flex direction="column" align="flex-end">
      <Box
        mt={{ '@initial': 'x4', '@768': 'x6' }}
        py="x4"
        px="x4"
        borderRadius={'phat'}
        borderStyle={'solid'}
        borderWidth={'normal'}
        borderColor={'border'}
        ref={containerRef}
        id={descriptionContentId}
        width="100%"
        className={!isExpanded && isOverHeight ? fadingEffect : ''}
        style={{
          maxHeight: isExpanded ? 'none' : UNEXPANDED_BOX_HEIGHT,
          overflow: isExpanded ? 'visible' : 'hidden',
        }}
      >
        <Box className={daoDescription}>
          <MarkdownDisplay>{displayDescription}</MarkdownDisplay>
        </Box>
      </Box>
      {isOverHeight && (
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          size="sm"
          px={'x0'}
          aria-expanded={isExpanded}
          aria-controls={descriptionContentId}
        >
          {isExpanded ? 'Collapse' : 'Read More'}
        </Button>
      )}
    </Flex>
  )
}
