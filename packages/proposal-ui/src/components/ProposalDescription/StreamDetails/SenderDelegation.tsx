import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useIsGnosisSafe } from '@buildeross/hooks/useIsGnosisSafe'
import { CHAIN_ID } from '@buildeross/types'
import { createSafeAppUrl, createSafeUrl } from '@buildeross/utils/safe'
import { atoms, Box, Button, Icon, Stack, Text } from '@buildeross/zord'
import { Address, isAddressEqual } from 'viem'
import { useAccount } from 'wagmi'

interface SenderDelegationProps {
  chainId: CHAIN_ID
  senderAddress: Address
  proposalUrl: string
}

export const SenderDelegation = ({
  chainId,
  senderAddress,
  proposalUrl,
}: SenderDelegationProps) => {
  const { displayName: senderDisplayName } = useEnsData(senderAddress)

  const { isGnosisSafe: isSenderAGnosisSafe } = useIsGnosisSafe(senderAddress, chainId)

  const { address } = useAccount()

  const isSenderConnected = address && isAddressEqual(senderAddress, address)

  return (
    <>
      <Stack direction="row" align="center" mt="x4">
        <Text variant="label-sm" color="primary" mr="x2">
          Stream Delegated to
        </Text>
        <Box color={'secondary'} className={atoms({ textDecoration: 'underline' })}>
          <a
            href={
              isSenderAGnosisSafe
                ? createSafeUrl(chainId, senderAddress)
                : `${ETHERSCAN_BASE_URL[chainId]}/address/${senderAddress}`
            }
            rel="noreferrer"
            target="_blank"
          >
            <Text variant="label-sm">{senderDisplayName || senderAddress}</Text>
          </a>
        </Box>
      </Stack>
      {isSenderAGnosisSafe && !isSenderConnected && (
        <Stack direction="column" fontWeight={'heading'} mt="x2" ml="x4" gap="x2">
          <a
            href={createSafeAppUrl(chainId, senderAddress, proposalUrl)}
            rel="noreferrer"
            target="_blank"
          >
            <Button variant="secondary" size="sm">
              View Proposal As Safe App
              <Icon id="arrowTopRight" />
            </Button>
          </a>
        </Stack>
      )}
    </>
  )
}
