import { atoms, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { ProposalNavigation } from 'src/modules/proposal'

import { TransactionType } from '../constants'

interface CreateProposalHeadingProps {
  title: string
  transactionType?: TransactionType
  align?: 'center' | 'left'
  showDocsLink?: boolean
}

export const CreateProposalHeading: React.FC<CreateProposalHeadingProps> = ({
  title,
  transactionType,
  align = 'left',
  showDocsLink = false,
}) => {
  return (
    <Stack mx={'auto'} pb={'x3'} w={'100%'}>
      <ProposalNavigation transactionType={transactionType} />
      <Flex
        direction="column"
        align={align === 'center' ? 'center' : 'flex-start'}
        mt={'x8'}
        mb={'x4'}
        gap={'x4'}
      >
        <Text
          fontSize={35}
          fontWeight={'label'}
          style={{ lineHeight: '44px' }}
          textAlign={align}
        >
          {title}
        </Text>
        {showDocsLink && (
          <a
            href="https://docs.nouns.build/onboarding/builder-proposal/"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Flex align={'center'} color={'text3'}>
              <Text
                fontWeight={'heading'}
                fontSize={14}
                className={atoms({ textDecoration: 'underline' })}
              >
                How to create a proposal?
              </Text>
              <Icon fill="text3" size="sm" ml="x1" id="external-16" />
            </Flex>
          </a>
        )}
      </Flex>
    </Stack>
  )
}
