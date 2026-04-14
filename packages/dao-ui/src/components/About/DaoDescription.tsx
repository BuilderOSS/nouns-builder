import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { Box, Button, Flex } from '@buildeross/zord'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { daoDescription, fadingEffect, UNEXPANDED_BOX_HEIGHT } from './mdRender.css'

export const DaoDescription = ({ description }: { description?: string }) => {
  const [isOverHeight, setIsOverHeight] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const textRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const correctedDescription = useMemo(() => {
    if (typeof description === 'string') {
      // Text processing on the backend (possibly subgraph) will sometimes replace
      // \n with \\n, which will break markdown.
      // This effect is intermittent, so this catches any instance where it happens
      return description.trim().replace(/\\n/g, '\n').replace(/\\r/g, '\r')
    }
    return ''
  }, [description])

  const collapsedHeight = useMemo(() => {
    return Number.parseInt(UNEXPANDED_BOX_HEIGHT, 10)
  }, [])

  const updateOverflowState = useCallback(() => {
    const contentHeight = contentRef.current?.scrollHeight || 0
    setIsOverHeight(contentHeight > collapsedHeight)
  }, [collapsedHeight])

  useEffect(() => {
    setIsExpanded(false)
  }, [correctedDescription])

  useEffect(() => {
    updateOverflowState()

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateOverflowState()
      })

      if (textRef.current) observer.observe(textRef.current)
      if (contentRef.current) observer.observe(contentRef.current)
    }

    window.addEventListener('resize', updateOverflowState)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateOverflowState)
    }
  }, [correctedDescription, updateOverflowState])

  if (!description || description.trim() === '') return null

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
        ref={textRef}
        width="100%"
        className={!isExpanded && isOverHeight ? fadingEffect : ''}
        style={{
          maxHeight: isExpanded ? 'none' : UNEXPANDED_BOX_HEIGHT,
          overflow: isExpanded ? 'visible' : 'hidden',
        }}
      >
        <Box className={daoDescription} ref={contentRef}>
          <MarkdownDisplay>{correctedDescription}</MarkdownDisplay>
        </Box>
      </Box>
      {isOverHeight && (
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          size="sm"
          px={'x0'}
        >
          {isExpanded ? 'Collapse' : 'Read More'}
        </Button>
      )}
    </Flex>
  )
}
