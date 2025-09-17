import { MarkdownDisplay } from '@buildeross/ui'
import { isPossibleMarkdown } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import HTMLReactParser from 'html-react-parser'
import React, { useEffect, useMemo, useRef } from 'react'
import { daoDescription as plainDesciption } from 'src/styles/About.css'

import { daoDescription, fadingEffect, UNEXPANDED_BOX_HEIGHT } from './mdRender.css'

export const DaoDescription = ({ description }: { description?: string }) => {
  const [isOverHeight, setIsOverHeight] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)

  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      textRef.current &&
      textRef?.current?.scrollHeight > textRef?.current?.clientHeight
    ) {
      setIsOverHeight(true)
    }
  }, [description])

  const correctedDescription = React.useMemo(() => {
    if (typeof description === 'string') {
      // Text processing on the backend (possibly subgraph) will sometimes replace
      // \n with \\n, which will break markdown.
      // This effect is intermittent, so this catches any instance where it happens
      return description.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
    }
  }, [description])

  // This regex check is large. Memoizing it for perf
  const isMarkdown = useMemo(() => {
    if (!description) return false
    return isPossibleMarkdown(description)
  }, [description])
  if (!correctedDescription || !description) return null

  if (!isMarkdown)
    return (
      <Box mt={{ '@initial': 'x4', '@768': 'x6' }}>
        <Text className={plainDesciption}>
          {HTMLReactParser(description.replace(/\\n/g, '<br />'))}
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
