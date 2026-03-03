import { atoms, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

type ProposalHelpLinksProps = {
  align?: 'left' | 'center'
}

export const ProposalHelpLinks: React.FC<ProposalHelpLinksProps> = ({
  align = 'left',
}) => {
  const alignment = align === 'center' ? 'center' : 'flex-start'

  return (
    <Stack gap={'x2'} align={alignment}>
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

      <a href="/guidelines" target="_blank" rel="noreferrer noopener">
        <Flex align={'center'} color={'text3'}>
          <Text
            fontWeight={'heading'}
            fontSize={14}
            className={atoms({ textDecoration: 'underline' })}
          >
            Tips for writing great proposals
          </Text>
          <Icon fill="text3" size="sm" ml="x1" id="external-16" />
        </Flex>
      </a>
    </Stack>
  )
}
