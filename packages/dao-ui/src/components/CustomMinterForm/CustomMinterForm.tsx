import { useEnsData } from '@buildeross/hooks/useEnsData'
import { tokenAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { SmartInput } from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Box, Flex, Heading, Input, Stack, Text, theme } from '@buildeross/zord'
import React from 'react'
import { isAddress } from 'viem'
import { useAccount, useConfig, useWriteContract } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'

import { adminSection } from '../../styles/Section.css'

export const CustomMinterForm: React.FC = () => {
  const { address: signerAddress } = useAccount()
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()

  const [recipient, setRecipient] = React.useState<string>('')
  const [tokenId, setTokenId] = React.useState<string>('')
  const [isMinting, setIsMinting] = React.useState(false)
  const [error, setError] = React.useState<string>('')
  const [success, setSuccess] = React.useState<string>('')

  // Get ENS data for signer address
  const { ensName: signerEnsName } = useEnsData(signerAddress)

  const handleMint = React.useCallback(async () => {
    if (!recipient) {
      setError('Please enter a recipient address')
      return
    }

    const trimmedTokenId = tokenId.trim()
    if (!trimmedTokenId || !/^\d+$/.test(trimmedTokenId)) {
      setError('Please enter a valid token ID (non-negative integer)')
      return
    }

    const tokenIdNumber = Number(trimmedTokenId)
    if (!Number.isInteger(tokenIdNumber) || tokenIdNumber < 0) {
      setError('Please enter a valid token ID (non-negative integer)')
      return
    }

    try {
      setIsMinting(true)
      setError('')
      setSuccess('')

      // Resolve ENS name to address if needed
      const resolvedRecipient = await getEnsAddress(recipient)

      if (!resolvedRecipient || !isAddress(resolvedRecipient)) {
        setError('Invalid recipient address')
        setIsMinting(false)
        return
      }

      const txHash = await writeContractAsync({
        abi: tokenAbi,
        address: addresses.token!,
        functionName: 'mintFromReserveTo',
        args: [resolvedRecipient as AddressType, BigInt(trimmedTokenId)],
        chainId: chain.id,
      })

      if (txHash) {
        await waitForTransactionReceipt(config, { hash: txHash, chainId: chain.id })
        const displayRecipient = recipient.endsWith('.eth')
          ? recipient
          : `${resolvedRecipient.slice(0, 6)}...${resolvedRecipient.slice(-4)}`
        setSuccess(`Token #${tokenId} minted successfully to ${displayRecipient}!`)
        setRecipient('')
        setTokenId('')
      }
    } catch (e) {
      console.error('Error minting token:', e)
      setError(e instanceof Error ? e.message : 'Failed to mint token')
    } finally {
      setIsMinting(false)
    }
  }, [recipient, tokenId, addresses.token, chain.id, config, writeContractAsync])

  const displaySignerAddress =
    signerEnsName ||
    (signerAddress ? `${signerAddress.slice(0, 6)}...${signerAddress.slice(-4)}` : '')

  return (
    <Flex direction="column" gap="x6" p="x6" className={adminSection}>
      <Box>
        <Heading size="md" mb="x2">
          Custom Minter
        </Heading>
        <Text color="text3">
          Your address ({displaySignerAddress}) is enabled as a custom minter. You can
          mint tokens from the reserve.
        </Text>
      </Box>

      <Stack gap="x4">
        <Box>
          <Text fontWeight="display" fontSize={14} mb="x2">
            Token ID
          </Text>
          <Input
            type="number"
            placeholder="Token ID"
            value={tokenId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTokenId(e.target.value)
            }
            disabled={isMinting}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: theme.colors.border,
            }}
          />
        </Box>

        <SmartInput
          id="recipient"
          inputLabel="Recipient Address"
          type="text"
          value={recipient}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setRecipient(e.target.value)
          }
          placeholder="0x... or .eth"
          disabled={isMinting}
          isAddress
        />

        {error && (
          <Text color="negative" fontSize={14}>
            {error}
          </Text>
        )}
        {success && (
          <Text color="positive" fontSize={14}>
            {success}
          </Text>
        )}

        <ContractButton
          chainId={chain.id}
          handleClick={handleMint}
          disabled={!recipient || !tokenId || !signerAddress || isMinting}
          loading={isMinting}
          variant="primary"
          style={{ width: '100%' }}
        >
          Mint Token
        </ContractButton>
      </Stack>

      <Box
        p="x4"
        borderRadius="curved"
        borderWidth="normal"
        borderStyle="solid"
        borderColor="border"
        backgroundColor="background2"
      >
        <Text color="text3" fontSize={14}>
          <strong>Note:</strong> As a custom minter, you have permission to mint specific
          token IDs from the reserve. Enter the token ID you want to mint and the
          recipient address who will receive it. The token must be available in the
          reserve.
        </Text>
      </Box>
    </Flex>
  )
}
