import { Box, Flex } from '@buildeross/zord'
import React from 'react'

import { CreateFormSection } from '../../types'
import { flowWrapper } from './CreateNavigation.css'
import { NavSection } from './NavSection'

export const CreateNavigation: React.FC<{
  sections: CreateFormSection[]
}> = ({ sections }) => (
  <Flex direction={'column'} width={'100%'}>
    <Box className={flowWrapper}>
      {!!sections &&
        sections.length > 0 &&
        sections?.map((section: CreateFormSection) => (
          <NavSection sections={sections} section={section} key={section.title} />
        ))}
    </Box>
  </Flex>
)
