import { Box, Text } from '@buildeross/zord'
import React from 'react'

import { sectionCopy, sectionHeader, sectionTitle } from '../AboutPage.css'

type SectionIntroProps = {
  eyebrowText: string
  title: string
  copy?: string
  copyClassName?: string
}

export const SectionIntro: React.FC<SectionIntroProps> = ({
  title,
  copy,
  copyClassName,
}) => {
  return (
    <Box className={sectionHeader}>
      <Text as="h2" className={sectionTitle}>
        {title}
      </Text>
      {copy ? <Text className={copyClassName || sectionCopy}>{copy}</Text> : null}
    </Box>
  )
}
