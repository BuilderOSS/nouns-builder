import { Stack, Text } from '@buildeross/zord'
import React from 'react'

import { ProposalNavigation } from 'src/modules/proposal'

import { TransactionType } from '../constants'

interface CreateProposalHeadingProps {
  title: string
  transactionType?: TransactionType
  align?: 'center' | 'left'
}

export const CreateProposalHeading: React.FC<CreateProposalHeadingProps> = ({
  title,
  transactionType,
  align = 'left',
}) => {
  return (
    <Stack mx={'auto'} pb={'x3'} w={'100%'}>
      <ProposalNavigation transactionType={transactionType} />
      <Text
        fontSize={35}
        fontWeight={'label'}
        style={{ lineHeight: '44px' }}
        mt={'x8'}
        textAlign={align}
      >
        {title}
      </Text>
    </Stack>
  )
}
