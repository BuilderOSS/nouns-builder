import { Box, type BoxProps } from '@buildeross/zord'
import { ReactNode } from 'react'

type SectionProps = {
  children: ReactNode
  title: string
  mb?: BoxProps['mb']
}

export const Section = ({ children, title, mb }: SectionProps) => (
  <Box mb={mb ?? { '@initial': 'x6', '@768': 'x13' }}>
    <Box fontSize={20} mb={{ '@initial': 'x4', '@768': 'x5' }} fontWeight={'display'}>
      {title}
    </Box>
    {children}
  </Box>
)
