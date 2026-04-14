import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { isPossibleMarkdown } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import HTMLReactParser from 'html-react-parser'
import { useEffect, useMemo, useRef, useState } from 'react'

import { daoDescription as plainDescription } from '../../styles/About.css'
import { daoDescription, fadingEffect, UNEXPANDED_BOX_HEIGHT } from './mdRender.css'

export const DaoDescription = ({ description }: { description?: string }) => {
  const [isOverHeight, setIsOverHeight] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const trimmedDescription = description?.trim()

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
      return description.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
    }
  }, [description])

  // This regex check is large. Memoizing it for perf
  const isMarkdown = useMemo(() => {
    if (!trimmedDescription) return false
    return isPossibleMarkdown(trimmedDescription)
  }, [trimmedDescription])

  if (!trimmedDescription || !correctedDescription) return null

  if (!isMarkdown)
    return (
      <Box mt={{ '@initial': 'x4', '@768': 'x6' }}>
        <Text className={plainDescription}>
          {HTMLReactParser(trimmedDescription.replace(/\\n/g, '<br />'))}
        </Text>
      </Box>
    )

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
