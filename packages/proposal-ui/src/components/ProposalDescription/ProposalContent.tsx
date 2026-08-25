import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { Box, Paragraph, Stack } from '@buildeross/zord'
import React from 'react'

import { proposalDescription } from './ProposalDescription.css'
import { Section } from './Section'

export { Section as ProposalSection }

export const ProposalContentCard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Stack
    p="x4"
    borderColor="border"
    borderStyle="solid"
    borderWidth="normal"
    borderRadius="curved"
  >
    {children}
  </Stack>
)

export const ProposalMarkdown: React.FC<{ children: string }> = ({ children }) => (
  <Paragraph overflow="auto">
    <Box className={proposalDescription}>
      <MarkdownDisplay>{children}</MarkdownDisplay>
    </Box>
  </Paragraph>
)
