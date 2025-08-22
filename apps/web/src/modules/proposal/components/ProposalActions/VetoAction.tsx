import { tokenAbi } from '@buildeross/sdk/contract'
import { AnimatedModal, SmartInput } from '@buildeross/ui'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import { useState } from 'react'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

import { GovernorContractButton } from '../GovernorContractButton'

interface OwnerActionsProps {
  proposalId: string
  proposalNumber: number
}

const VetoModal: React.FC<{
  proposalId: string
  proposalNumber: number
  setOpen: (open: boolean) => void
}> = ({ proposalId, proposalNumber, setOpen }) => {
  const [confirmValue, setConfirmValue] = useState('')
  const isConfirmed = confirmValue === 'VETO'

  return (
    <Box position={'relative'}>
      <Box
        as={'button'}
        onClick={() => setOpen(false)}
        cursor={'pointer'}
        backgroundColor="transparent"
        borderColor="transparent"
        position={'absolute'}
        top={'x0'}
        right={'x0'}
      >
        <Icon id="cross-16" />
      </Box>
      <Flex align={'center'}>
        <Icon id="warning" fill="negative" mr="x2" />
        <Text style={{ fontWeight: 600, fontSize: 26 }}>
          Veto proposal {proposalNumber}
        </Text>
      </Flex>
      <Text mt="x2">Are you absolutely sure? This action is not reversible.</Text>
      <Text mt="x2" mb="x8">
        Please type 'VETO' to confirm.
      </Text>
      <SmartInput
        id="confirm"
        type={'text'}
        value={confirmValue}
        onChange={(e: any) => setConfirmValue(e.target.value)}
        onBlur={() => {}}
      />

      <Box w="100%">
        {isConfirmed ? (
          <GovernorContractButton
            functionName="veto"
            args={[proposalId as Address]}
            proposalId={proposalId}
            buttonText="Confirm and veto this proposal"
            onSuccess={() => {}}
            w="100%"
            variant="destructive"
          />
        ) : (
          <Button disabled={true} w="100%">
            Confirm and veto
          </Button>
        )}
      </Box>
    </Box>
  )
}

export const VetoAction: React.FC<OwnerActionsProps> = ({
  proposalId,
  proposalNumber,
}) => {
  const [open, setOpen] = useState(false)
  const {
    addresses: { token },
  } = useDaoStore()
  const { chain } = useChainStore()
  const { isMobile } = useLayoutStore()

  const tokenContractParams = {
    abi: tokenAbi,
    address: token as Address,
    chainId: chain.id,
  }

  const { data: daoName } = useReadContract({
    ...tokenContractParams,
    functionName: 'name',
  })

  return (
    <Flex
      direction={{ '@initial': 'column', '@768': 'row' }}
      w={'100%'}
      align={'center'}
      justify={'space-between'}
      p={{ '@initial': 'x4', '@768': 'x6' }}
      gap={'x3'}
      borderStyle={'solid'}
      borderWidth={'normal'}
      borderRadius={'curved'}
      style={{ borderColor: 'rgba(240, 50, 50, 0.1)' }}
    >
      <Text>
        You have{' '}
        <Text as="span" color="negative">
          veto power
        </Text>{' '}
        for {daoName || ''}
      </Text>
      <AnimatedModal
        open={open}
        close={() => setOpen(false)}
        trigger={
          <Button
            onClick={() => setOpen(true)}
            variant="destructive"
            w={isMobile ? '100%' : 'unset'}
          >
            Veto proposal
          </Button>
        }
      >
        <VetoModal
          proposalId={proposalId}
          proposalNumber={proposalNumber}
          setOpen={setOpen}
        />
      </AnimatedModal>
    </Flex>
  )
}
