import {
  EAS_CONTRACT_ADDRESS,
  easAbi,
  PROFILE_LINK_EAS_CHAIN_ID,
  PROFILE_LINK_SCHEMA,
  PROFILE_LINK_SCHEMA_UID,
} from '@buildeross/constants'
import type { AddressType } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import React from 'react'
import {
  delegateModalSection,
  filterLabel,
  profileLinkEditInput,
} from 'src/styles/profile.css'
import {
  normalizeFarcasterHandle,
  normalizeXHandle,
  type ProfileIdentity,
  validateWebsiteUrl,
} from 'src/utils/profileIdentity'
import { encodeAbiParameters, zeroHash } from 'viem'
import { useAccount, useConfig, useSwitchChain } from 'wagmi'
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions'

type ProfileLinkKey = 'website' | 'x' | 'farcaster'

type ProfileLinkUpdate = {
  key: ProfileLinkKey
  value: string
}

type ProfileLinksEditModalProps = {
  identity?: ProfileIdentity
  profileAddress: AddressType
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export const ProfileLinksEditModal: React.FC<ProfileLinksEditModalProps> = ({
  identity,
  profileAddress,
  open,
  onClose,
  onSaved,
}) => {
  const config = useConfig()
  const { chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const [website, setWebsite] = React.useState('')
  const [xHandle, setXHandle] = React.useState('')
  const [farcasterHandle, setFarcasterHandle] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [txHashes, setTxHashes] = React.useState<`0x${string}`[]>([])
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setWebsite(identity?.website?.href ?? '')
    setXHandle(identity?.x?.label ?? '')
    setFarcasterHandle(identity?.farcaster?.label ?? '')
    setError(null)
    setTxHashes([])
    setIsSaving(false)
  }, [identity, open])

  const buildUpdates = (): ProfileLinkUpdate[] => {
    const nextWebsiteInput = website.trim()
    const nextXInput = xHandle.trim()
    const nextFarcasterInput = farcasterHandle.trim()
    const currentWebsite = identity?.website?.href ?? ''
    const currentXHandle = identity?.x?.handle ?? ''
    const currentFarcasterHandle = identity?.farcaster?.handle ?? ''

    const normalizedWebsite = nextWebsiteInput
      ? validateWebsiteUrl(nextWebsiteInput)
      : null
    const normalizedX = nextXInput ? normalizeXHandle(nextXInput) : null
    const normalizedFarcaster = nextFarcasterInput
      ? normalizeFarcasterHandle(nextFarcasterInput)
      : null

    if (nextWebsiteInput && !normalizedWebsite) {
      throw new Error('Enter a valid website URL.')
    }

    if (nextXInput && !normalizedX) {
      throw new Error('Enter a valid X handle.')
    }

    if (nextFarcasterInput && !normalizedFarcaster) {
      throw new Error('Enter a valid Farcaster handle.')
    }

    const nextWebsiteValue = normalizedWebsite ?? ''
    const nextXValue = normalizedX?.handle ?? ''
    const nextFarcasterValue = normalizedFarcaster?.handle ?? ''

    return [
      ...(nextWebsiteValue !== currentWebsite
        ? [{ key: 'website' as const, value: nextWebsiteValue }]
        : []),
      ...(nextXValue !== currentXHandle
        ? [{ key: 'x' as const, value: nextXValue }]
        : []),
      ...(nextFarcasterValue !== currentFarcasterHandle
        ? [{ key: 'farcaster' as const, value: nextFarcasterValue }]
        : []),
    ]
  }

  const attestProfileLinks = async (
    easAddress: `0x${string}`,
    updates: ProfileLinkUpdate[]
  ): Promise<`0x${string}`> => {
    const hash = await writeContract(config, {
      abi: easAbi,
      address: easAddress,
      chainId: PROFILE_LINK_EAS_CHAIN_ID,
      functionName: 'multiAttest',
      args: [
        [
          {
            schema: PROFILE_LINK_SCHEMA_UID,
            data: updates.map((update) => ({
              recipient: profileAddress,
              expirationTime: 0n,
              revocable: true,
              refUID: zeroHash,
              data: encodeAbiParameters(
                [
                  { name: 'key', type: 'string' },
                  { name: 'value', type: 'string' },
                ],
                [update.key, update.value]
              ),
              value: 0n,
            })),
          },
        ],
      ],
    })
    await waitForTransactionReceipt(config, {
      hash,
      chainId: PROFILE_LINK_EAS_CHAIN_ID,
    })

    return hash
  }

  const saveProfileLinks = async (
    easAddress: `0x${string}`,
    updates: ProfileLinkUpdate[]
  ): Promise<`0x${string}`[]> => [await attestProfileLinks(easAddress, updates)]

  const handleSave = async () => {
    let updates: ProfileLinkUpdate[]

    try {
      updates = buildUpdates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid profile link input.')
      return
    }

    if (!updates.length) {
      onClose()
      return
    }

    setError(null)
    setTxHashes([])
    setIsSaving(true)

    try {
      if (chainId !== PROFILE_LINK_EAS_CHAIN_ID && switchChainAsync) {
        await switchChainAsync({ chainId: PROFILE_LINK_EAS_CHAIN_ID })
      }

      const profileLinkChainId =
        PROFILE_LINK_EAS_CHAIN_ID as keyof typeof EAS_CONTRACT_ADDRESS
      const easAddress = EAS_CONTRACT_ADDRESS[profileLinkChainId] as
        | `0x${string}`
        | undefined
      if (!easAddress) {
        throw new Error('Profile link attestations are not supported on this network.')
      }

      const hashes = await saveProfileLinks(easAddress, updates)

      setTxHashes(hashes)
      onSaved?.()
    } catch (err) {
      console.error('Failed to update profile links:', err)
      const message = err instanceof Error ? err.message : ''
      const lowerMessage = message.toLowerCase()
      setError(
        lowerMessage.includes('429') ||
          lowerMessage.includes('too many requests') ||
          lowerMessage.includes('cors') ||
          lowerMessage.includes('failed to fetch')
          ? 'Base RPC is rate limiting requests. Please wait a minute and try again, or switch to a wallet/RPC that is not rate-limited.'
          : message ||
              'Profile links update failed. Please check your wallet and try again.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatedModal open={open} close={onClose} size="medium">
      <Flex direction="column" gap="x5" w="100%">
        <Flex direction="column" gap="x2">
          <Text variant="heading-sm">Edit links</Text>
          <Text color="text3">
            ENS links are used by default. Saving creates Builder-only profile overrides
            on Base.
          </Text>
        </Flex>

        <Box className={delegateModalSection}>
          <Flex direction="column" gap="x4">
            <label>
              <Text className={filterLabel}>Website</Text>
              <input
                className={profileLinkEditInput}
                placeholder="https://example.com"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </label>

            <label>
              <Text className={filterLabel}>X</Text>
              <input
                className={profileLinkEditInput}
                placeholder="@handle"
                value={xHandle}
                onChange={(event) => setXHandle(event.target.value)}
              />
            </label>

            <label>
              <Text className={filterLabel}>Farcaster</Text>
              <input
                className={profileLinkEditInput}
                placeholder="@handle"
                value={farcasterHandle}
                onChange={(event) => setFarcasterHandle(event.target.value)}
              />
            </label>
          </Flex>
        </Box>

        <Box className={delegateModalSection}>
          <Text color="text3" fontSize="14">
            This attests the fields you changed with the {PROFILE_LINK_SCHEMA} EAS schema.
            The schema is pre-registered on the supported Base network.
          </Text>
        </Box>

        {error ? (
          <Text color="negative" style={{ wordBreak: 'break-word' }}>
            {error}
          </Text>
        ) : null}

        {txHashes.length ? (
          <Text color="positive">
            Links updated. Refresh may take a moment while the subgraph indexes the
            attestation.
          </Text>
        ) : null}

        <Flex justify="flex-end" gap="x3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save links'}
          </Button>
        </Flex>
      </Flex>
    </AnimatedModal>
  )
}
