import { Flex, Paragraph, Text } from '@buildeross/zord'
import React from 'react'

import { detail } from './DaoCard.css'

export const Detail = ({ title, content }: { title: string; content: string }) => (
  <Flex direction={'column'} p={'x4'} className={detail}>
    <Paragraph color={'text3'}>{title}</Paragraph>
    <Text variant="label-md">{content}</Text>
  </Flex>
)
