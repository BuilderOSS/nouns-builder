import { Box, Flex } from '@buildeross/zord'
import React, { ReactNode } from 'react'

import {
  infoSectionLabelStyle,
  infoSectionStyle,
  infoSectionValueStyle,
  infoSectionValueWrapperStyle,
} from './ReviewItem.css'

interface ReviewItem {
  label: string
  value: string | ReactNode
  sub?: boolean
}
export const ReviewItem: React.FC<ReviewItem> = ({ label, value }) => {
  return (
    <Flex width={'100%'} direction={'column'} className={infoSectionStyle}>
      <Box className={infoSectionLabelStyle} mt={'x4'}>
        {label}
      </Box>
      <Flex align={'center'} fontSize={18} className={infoSectionValueWrapperStyle}>
        <Flex className={infoSectionValueStyle} width="100%">
          {value}
        </Flex>
      </Flex>
    </Flex>
  )
}
