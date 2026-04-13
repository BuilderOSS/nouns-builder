import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { Box, Button, Flex } from '@buildeross/zord'
import { useEffect, useMemo, useRef, useState } from 'react'

import { daoDescription, fadingEffect, UNEXPANDED_BOX_HEIGHT } from './mdRender.css'

export const DaoDescription = ({ description }: { description?: string }) => {
  const [isOverHeight, setIsOverHeight] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      textRef.current &&
      textRef?.current?.scrollHeight > textRef?.current?.clientHeight
    ) {
      setIsOverHeight(true)
    }
  }, [description])

  const correctedDescription = useMemo(() => {
    if (typeof description === 'string') {
      // Text processing on the backend (possibly subgraph) will sometimes replace
      // \n with \\n, which will break markdown.
      // This effect is intermittent, so this catches any instance where it happens
      return description.trim().replace(/\\n/g, '\n').replace(/\\r/g, '\r')
    }
    return ''
  }, [description])

  if (!description || description.trim() === '') return null

  return (
    <Flex direction="column" align="flex-end">
      <Box
        mt={{ '@initial': 'x4', '@768': 'x6' }}
        py="x2"
        px={{ '@initial': 'x2', '@768': 'x4' }}
        borderRadius={'phat'}
        borderStyle={'solid'}
        borderWidth={'normal'}
        borderColor={'border'}
        ref={textRef}
        width="100%"
        className={!isExpanded && isOverHeight ? fadingEffect : ''}
        style={{
          maxHeight: isExpanded ? '100%' : UNEXPANDED_BOX_HEIGHT,
        }}
      >
        <Box className={daoDescription}>
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
