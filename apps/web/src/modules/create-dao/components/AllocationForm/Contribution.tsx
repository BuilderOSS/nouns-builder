import { formatDate } from '@buildeross/utils/helpers'
import { Flex, Text } from '@buildeross/zord'
import React, { ReactNode } from 'react'

export const Contribution = ({
  address,
  allocation,
  endDate,
}: {
  address: ReactNode
  allocation: string | number
  endDate: string
}) => (
  <Flex direction={'row'} py={'x4'}>
    {address}
    <Flex align={'center'} style={{ width: '25%' }}>
      <Text>{allocation}%</Text>
    </Flex>
    <Flex align={'center'} style={{ width: '25%' }}>
      <Text>{formatDate(endDate, true)}</Text>
    </Flex>
  </Flex>
)
