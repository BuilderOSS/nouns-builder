import { getFetchableUrls } from '@buildeross/ipfs-service'
import { metadataAbi, tokenAbi } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { Avatar } from 'src/components/Avatar/Avatar'
import { FallbackNextImage } from 'src/components/FallbackImage'
import { Icon } from 'src/components/Icon'
import AnimatedModal from 'src/components/Modal/AnimatedModal'
import { OptionalLink } from 'src/components/OptionalLink'
import { Queue, TransactionType, useProposalStore } from 'src/modules/create-proposal'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { useReadContracts } from 'wagmi'

interface ProposalNavigationProps {
  transactionType?: TransactionType
  handleBack?: () => void
}

export const ProposalNavigation: React.FC<ProposalNavigationProps> = ({
  transactionType,
  handleBack,
}) => {
  const router = useRouter()
  const chain = useChainStore((x) => x.chain)
  const addresses = useDaoStore((state) => state.addresses)
  const transactions = useProposalStore((state) => state.transactions)
  const [queueModalOpen, setQueueModalOpen] = useState(false)

  const token = addresses?.token
  const metadata = addresses?.metadata

  const { data: contractData } = useReadContracts({
    allowFailure: false,
    query: {
      enabled: !!token && !!metadata,
    },
    contracts: [
      {
        abi: tokenAbi,
        address: token as AddressType,
        chainId: chain.id,
        functionName: 'name',
      },
      {
        abi: metadataAbi,
        address: metadata as AddressType,
        chainId: chain.id,
        functionName: 'contractImage',
      },
    ] as const,
  })

  const [name, daoImage] = unpackOptionalArray(contractData, 2)

  const handleNavigation = () => {
    handleBack ? handleBack() : router.back()
  }

  return (
    <Flex direction={'column'} w={'100%'} align={'center'} mt={'x8'}>
      <Flex w={'100%'} justify="space-between">
        <Box onClick={handleNavigation} aria-label="Back" cursor={'pointer'}>
          <Flex direction={'row'} align={'center'} gap={'x2'}>
            <Icon id="arrowLeft" />

            {daoImage ? (
              <Box mr="x2">
                <FallbackNextImage
                  srcList={getFetchableUrls(daoImage)}
                  style={{ borderRadius: '100%', objectFit: 'contain' }}
                  alt={`${name} avatar`}
                  height={32}
                  width={32}
                />
              </Box>
            ) : (
              <Box mr="x2" borderRadius="phat">
                <Avatar address={token ?? undefined} size="32" />
              </Box>
            )}

            {name && (
              <Text data-testid="dao-name" fontSize={16} fontWeight={'display'}>
                {name}
              </Text>
            )}
          </Flex>
        </Box>
        {transactionType ? (
          <Box>
            <Flex>
              <Button mr="x6" variant="secondary" onClick={() => setQueueModalOpen(true)}>
                {`${transactions.length} transactions queued`}
              </Button>
              <OptionalLink
                enabled={!!transactions.length}
                href={`/dao/${chain.slug}/${token}/proposal/review`}
              >
                <Button disabled={!transactions.length}>Continue</Button>
              </OptionalLink>
            </Flex>
          </Box>
        ) : null}
      </Flex>
      <AnimatedModal close={() => setQueueModalOpen(false)} open={queueModalOpen}>
        <Queue setQueueModalOpen={setQueueModalOpen} />
      </AnimatedModal>
    </Flex>
  )
}
