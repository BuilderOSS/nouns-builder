import { type DaoMembership } from '@buildeross/hooks/useDaoMembership'
import { Avatar } from '@buildeross/ui/Avatar'
import { CopyButton } from '@buildeross/ui/CopyButton'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex } from '@buildeross/zord'
import React from 'react'

import { currentDelegateBtn, proposalFormTitle } from './Activity.css'

interface CurrentDelegateProps {
  toggleIsEditing: () => void
  membership: DaoMembership
}

export const CurrentDelegate = ({
  toggleIsEditing,
  membership,
}: CurrentDelegateProps) => {
  return (
    <Flex direction={'column'} width={'100%'}>
      <Box className={proposalFormTitle} fontSize={28} mb={'x4'}>
        Votes
      </Box>

      <Box mb={'x8'} color="text3">
        {membership.voteDescription}
      </Box>

      <Box mb={'x2'}>Current delegate</Box>

      <Flex
        align={'center'}
        height={'x16'}
        mb={'x6'}
        borderColor="border"
        borderWidth="normal"
        borderStyle="solid"
        borderRadius="curved"
        gap={'x4'}
        pr={'x4'}
      >
        <Flex
          as="a"
          target="_blank"
          rel="noreferrer noopener"
          href={`/profile/${membership.delegate.ethAddress}`}
          align={'center'}
          px={'x6'}
          height="100%"
          flex={1}
          className={currentDelegateBtn}
          style={{ cursor: 'pointer' }}
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
        </Flex>
        <CopyButton text={membership.delegate.ethAddress} />
      </Flex>

      <Box>
        <Button width={'100%'} onClick={toggleIsEditing} size="lg">
          Update delegate
        </Button>
      </Box>
    </Flex>
  )
}
