import { Box, Flex, Label } from '@buildeross/zord'
import React from 'react'

import { CandidateState, parseBgColor, parseState } from './CandidateStatus.helper'

type StatusProps = {
  state: CandidateState
  className?: string
}

export const CandidateStatus: React.FC<StatusProps> = ({ className, state }) => {
  return (
    <Flex className={className} align="center">
      <Box
        py={'x1'}
        px={'x3'}
        borderRadius={'round'}
        borderStyle={'solid'}
        borderWidth={'normal'}
        style={parseBgColor(state)}
      >
        <Label size="sm">{parseState(state)}</Label>
      </Box>
    </Flex>
  )
}
