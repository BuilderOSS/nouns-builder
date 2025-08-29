import { Stack } from '@buildeross/zord'
import React, { ReactElement } from 'react'

import { AccordionItem } from './AccordionItem'

export const Accordion: React.FC<{
  items: { title: string | ReactElement; description: ReactElement }[]
}> = ({ items }) => {
  return (
    <Stack>
      {items?.map((item, key) => (
        <AccordionItem key={key} title={item.title} description={item.description} />
      ))}
    </Stack>
  )
}
