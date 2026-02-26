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
  showContinue?: boolean
  onOpenProposalReview?: () => void
  showDocsLink?: boolean
  handleBack: () => void
  queueButtonClassName?: string
}

export const CreateProposalHeading: React.FC<CreateProposalHeadingProps> = ({
  title,
  align = 'left',
  showDocsLink = false,
  showQueue = false,
  showContinue = true,
  handleBack,
  onOpenProposalReview,
  queueButtonClassName,
}) => {
  const [queueModalOpen, setQueueModalOpen] = useState(false)
  const transactions = useProposalStore((state) => state.transactions)
  return (
    <Stack mx={'auto'} pb={'x3'} w={'100%'}>
      <ProposalNavigation handleBack={handleBack}>
        {(showQueue || showContinue) && (
          <Flex align="center" direction="row" justify="flex-end" w="100%">
            <Flex>
              {showQueue && (
                <Button
                  mr="x6"
                  variant="secondary"
                  onClick={() => setQueueModalOpen(true)}
                  disabled={!transactions.length}
                  className={queueButtonClassName}
                >
                  {`${transactions.length} transaction${transactions.length === 1 ? '' : 's'} queued`}
                </Button>
              )}
              {showContinue && onOpenProposalReview && (
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
