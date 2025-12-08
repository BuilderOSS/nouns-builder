import { Stack } from '@buildeross/zord'
import React, { ReactElement } from 'react'

import { AccordionItem } from './AccordionItem'

export const Accordion: React.FC<{
  items: {
    title: string | ReactElement
    description: ReactElement
    summary?: string | ReactElement
    defaultOpen?: boolean
    titleFontSize?: number
    summaryFontSize?: number
    mb?: any
  }[]
}> = ({ items }) => {
  return (
    <Stack>
      {items?.map((item, key) => (
        <AccordionItem
          key={key}
          title={item.title}
          description={item.description}
          summary={item.summary}
          defaultOpen={item.defaultOpen}
          titleFontSize={item.titleFontSize}
          summaryFontSize={item.summaryFontSize}
          mb={item.mb}
        />
      ))}
    </Stack>
  )
}
