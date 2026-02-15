import { ProposalNavigation } from '@buildeross/proposal-ui'
import { useProposalStore } from '@buildeross/stores'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { atoms, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React, { useState } from 'react'

import { Queue } from '../Queue'

interface CreateProposalHeadingProps {
  title: string
  align?: 'center' | 'left'
  showQueue?: boolean
  onOpenProposalReview?: () => void
  showDocsLink?: boolean
  handleBack: () => void
}

export const CreateProposalHeading: React.FC<CreateProposalHeadingProps> = ({
  title,
  align = 'left',
  showDocsLink = false,
  showQueue = false,
  handleBack,
  onOpenProposalReview,
}) => {
  const [queueModalOpen, setQueueModalOpen] = useState(false)
  const transactions = useProposalStore((state) => state.transactions)
  return (
    <Stack mx={'auto'} pb={'x3'} w={'100%'}>
      <ProposalNavigation handleBack={handleBack}>
        {showQueue && (
          <Flex align="center" direction="row" justify="flex-end" w="100%">
            <Flex>
              {transactions.length > 0 && (
                <Button
                  mr="x6"
                  variant="secondary"
                  onClick={() => setQueueModalOpen(true)}
                >
                  {`${transactions.length} transaction${transactions.length > 1 ? 's' : ''} queued`}
                </Button>
              )}
              {onOpenProposalReview && (
                <Button disabled={!transactions.length} onClick={onOpenProposalReview}>
                  Continue
                </Button>
              )}
            </Flex>
          </Flex>
        )}
      </ProposalNavigation>
      <AnimatedModal close={() => setQueueModalOpen(false)} open={queueModalOpen}>
        <Queue setQueueModalOpen={setQueueModalOpen} />
      </AnimatedModal>
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
