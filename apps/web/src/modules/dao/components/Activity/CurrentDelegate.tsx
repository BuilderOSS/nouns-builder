import { Box, Button, Flex } from '@zoralabs/zord'
import React from 'react'

import { Avatar } from 'src/components/Avatar'
import { Icon } from 'src/components/Icon'
import { ETHERSCAN_BASE_URL } from 'src/constants/etherscan'
import { type DaoMembership } from 'src/hooks/useDaoMembership'
import { useChainStore } from 'src/stores/useChainStore'
import { proposalFormTitle } from 'src/styles/Proposals.css'
import { walletSnippet } from 'src/utils/helpers'

interface CurrentDelegateProps {
  toggleIsEditing: () => void
  membership: DaoMembership
}

export const CurrentDelegate = ({
  toggleIsEditing,
  membership,
}: CurrentDelegateProps) => {
  const chain = useChainStore((x) => x.chain)

  return (
    <Flex direction={'column'} width={'100%'}>
      <Box className={proposalFormTitle} fontSize={28} mb={'x4'}>
        Votes
      </Box>

      <Box mb={'x8'} color="text3">
        {membership.voteDescription}
      </Box>

      <Box mb={'x2'}>Current delegate</Box>

      <Box>
        <Flex
          align={'center'}
          height={'x16'}
          mb={'x6'}
          px={'x6'}
          borderColor="border"
          borderWidth="normal"
          borderStyle="solid"
          borderRadius="curved"
        >
          <Box mr={'x2'}>
            {membership.delegate.ensAvatar ? (
              <img
                src={membership.delegate.ensAvatar}
                alt="avatar"
                height={28}
                width={28}
              />
            ) : (
              <Avatar address={membership.delegate.ethAddress} size={'28'} />
            )}
          </Box>

          {membership.delegate.ensName ? (
            <>
              <Box mr={'x2'}>{membership.delegate.ensName}</Box>
              <Box color="text4" ml="auto">
                {walletSnippet(membership.delegate.ethAddress)}
              </Box>
            </>
          ) : (
            <Box mr="auto">{walletSnippet(membership.delegate.ethAddress)}</Box>
          )}

          <Box
            as="a"
            ml={'x3'}
            href={`${ETHERSCAN_BASE_URL[chain.id]}/address/${membership.delegate.ethAddress}`}
            target="_blank"
          >
            <Icon size="sm" id="external-16" fill="text4" />
          </Box>
        </Flex>

        <Box>
          <Button width={'100%'} onClick={toggleIsEditing} size="lg">
            Update delegate
          </Button>
        </Box>
      </Box>
    </Flex>
  )
}
