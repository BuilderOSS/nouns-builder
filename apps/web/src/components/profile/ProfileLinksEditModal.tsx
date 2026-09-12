import {
  EAS_CONTRACT_ADDRESS,
  easAbi,
  PROFILE_LINK_EAS_CHAIN_ID,
  PROFILE_LINK_SCHEMA_UID,
} from '@buildeross/constants'
import { awaitSubgraphSync } from '@buildeross/sdk/subgraph'
import type { AddressType } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import { useFormik } from 'formik'
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

import {
  type ProfileLinksFormValues,
  profileLinksValidationSchema,
} from './ProfileLinksEditModal.schema'

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
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = React.useState(false)
  const mountedRef = React.useRef(true)

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const formik = useFormik<ProfileLinksFormValues>({
    initialValues: {
      website: identity?.website?.href ?? '',
      xHandle: identity?.x?.label ?? '',
      farcasterHandle: identity?.farcaster?.label ?? '',
    },
    validationSchema: profileLinksValidationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: handleSave,
  })

  const { resetForm } = formik

  React.useEffect(() => {
    if (!open) return
    resetForm()
    setError(null)
    setIsSaving(false)
    setIsSyncing(false)
    setIsSwitchingNetwork(false)
  }, [open, resetForm])

  const buildUpdates = (values: ProfileLinksFormValues): ProfileLinkUpdate[] => {
    const nextWebsiteInput = values.website.trim()
    const nextXInput = values.xHandle.trim()
    const nextFarcasterInput = values.farcasterHandle.trim()
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
  ): Promise<void> => {
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

    const receipt = await waitForTransactionReceipt(config, {
      hash,
      chainId: PROFILE_LINK_EAS_CHAIN_ID,
    })

    if (!mountedRef.current) return

    setIsSaving(false)
    setIsSyncing(true)

    await awaitSubgraphSync(PROFILE_LINK_EAS_CHAIN_ID, receipt.blockNumber)
  }

  async function handleSave(values: ProfileLinksFormValues) {
    const updates = buildUpdates(values)

    if (!updates.length) {
      onClose()
      return
    }

    setError(null)
    setIsSaving(true)
    setIsSyncing(false)
    setIsSwitchingNetwork(false)

    try {
      // Handle chain switching
      if (chainId !== PROFILE_LINK_EAS_CHAIN_ID && switchChainAsync) {
        try {
          if (!mountedRef.current) return
          setIsSwitchingNetwork(true)
          await switchChainAsync({ chainId: PROFILE_LINK_EAS_CHAIN_ID })
          if (!mountedRef.current) return
          setIsSwitchingNetwork(false)
        } catch (switchError) {
          if (!mountedRef.current) return
          setIsSwitchingNetwork(false)
          throw new Error(
            'Network switch was rejected. Please switch to Base network to save profile links.'
          )
        }
      }

      const profileLinkChainId =
        PROFILE_LINK_EAS_CHAIN_ID as keyof typeof EAS_CONTRACT_ADDRESS
      const easAddress = EAS_CONTRACT_ADDRESS[profileLinkChainId] as
        | `0x${string}`
        | undefined
      if (!easAddress) {
        throw new Error('Profile link attestations are not supported on this network.')
      }

      await attestProfileLinks(easAddress, updates)

      if (!mountedRef.current) return

      // Call onSaved after subgraph sync - wrapped in try-catch
      try {
        onSaved?.()
      } catch (callbackError) {
        console.error('onSaved callback error:', callbackError)
      }

      // Auto-close modal
      onClose()
    } catch (err) {
      if (!mountedRef.current) return

      console.error('Failed to update profile links:', err)
      const message = err instanceof Error ? err.message : ''
      const lowerMessage = message.toLowerCase()

      // Handle user rejection
      if (lowerMessage.includes('user rejected')) {
        setError('Transaction was cancelled')
        setIsSaving(false)
        setIsSyncing(false)
        setIsSwitchingNetwork(false)
        return
      }

      // Handle RPC/network errors
      if (
        lowerMessage.includes('429') ||
        lowerMessage.includes('too many requests') ||
        lowerMessage.includes('cors') ||
        lowerMessage.includes('failed to fetch')
      ) {
        setError(
          'Base RPC is rate limiting requests. Please wait a minute and try again, or switch to a wallet/RPC that is not rate-limited.'
        )
        setIsSaving(false)
        setIsSyncing(false)
        setIsSwitchingNetwork(false)
        return
      }

      // Truncate to first line for all other errors
      const truncatedMessage = message.split('\n')[0] || message

      setError(
        truncatedMessage ||
          'Profile links update failed. Please check your wallet and try again.'
      )
      setIsSaving(false)
      setIsSyncing(false)
      setIsSwitchingNetwork(false)
    }
  }

  const isLoading = isSaving || isSyncing || isSwitchingNetwork
  const getButtonText = () => {
    if (isSwitchingNetwork) return 'Switching network...'
    if (isSaving) return 'Saving...'
    if (isSyncing) return 'Syncing...'
    return 'Save links'
  }

  return (
    <AnimatedModal open={open} close={onClose} size="medium">
      <form onSubmit={formik.handleSubmit}>
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
              <Flex direction="column" gap="x1">
                <label htmlFor="profile-link-website">
                  <Text className={filterLabel}>Website</Text>
                </label>
                <input
                  id="profile-link-website"
                  className={profileLinkEditInput}
                  type="url"
                  placeholder="https://example.com"
                  aria-invalid={
                    formik.touched.website && formik.errors.website ? 'true' : 'false'
                  }
                  aria-describedby={
                    formik.touched.website && formik.errors.website
                      ? 'profile-link-website-error'
                      : undefined
                  }
                  {...formik.getFieldProps('website')}
                />
                {formik.touched.website && formik.errors.website ? (
                  <Text
                    id="profile-link-website-error"
                    color="negative"
                    style={{ fontSize: 12, marginTop: 4 }}
                  >
                    {formik.errors.website}
                  </Text>
                ) : null}
              </Flex>

              <Flex direction="column" gap="x1">
                <label htmlFor="profile-link-x">
                  <Text className={filterLabel}>X</Text>
                </label>
                <input
                  id="profile-link-x"
                  className={profileLinkEditInput}
                  type="text"
                  placeholder="@handle"
                  aria-invalid={
                    formik.touched.xHandle && formik.errors.xHandle ? 'true' : 'false'
                  }
                  aria-describedby={
                    formik.touched.xHandle && formik.errors.xHandle
                      ? 'profile-link-x-error'
                      : undefined
                  }
                  {...formik.getFieldProps('xHandle')}
                />
                {formik.touched.xHandle && formik.errors.xHandle ? (
                  <Text
                    id="profile-link-x-error"
                    color="negative"
                    style={{ fontSize: 12, marginTop: 4 }}
                  >
                    {formik.errors.xHandle}
                  </Text>
                ) : null}
              </Flex>

              <Flex direction="column" gap="x1">
                <label htmlFor="profile-link-farcaster">
                  <Text className={filterLabel}>Farcaster</Text>
                </label>
                <input
                  id="profile-link-farcaster"
                  className={profileLinkEditInput}
                  type="text"
                  placeholder="@handle"
                  aria-invalid={
                    formik.touched.farcasterHandle && formik.errors.farcasterHandle
                      ? 'true'
                      : 'false'
                  }
                  aria-describedby={
                    formik.touched.farcasterHandle && formik.errors.farcasterHandle
                      ? 'profile-link-farcaster-error'
                      : undefined
                  }
                  {...formik.getFieldProps('farcasterHandle')}
                />
                {formik.touched.farcasterHandle && formik.errors.farcasterHandle ? (
                  <Text
                    id="profile-link-farcaster-error"
                    color="negative"
                    style={{ fontSize: 12, marginTop: 4 }}
                  >
                    {formik.errors.farcasterHandle}
                  </Text>
                ) : null}
              </Flex>
            </Flex>
          </Box>

          {error ? (
            <Text
              color="negative"
              style={{ wordBreak: 'break-word' }}
              role="alert"
              aria-live="polite"
            >
              {error}
            </Text>
          ) : null}

          <Flex justify="flex-end" gap="x3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              type="button"
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={!formik.dirty || !formik.isValid || isLoading}
            >
              {getButtonText()}
            </Button>
          </Flex>
        </Flex>
      </form>
    </AnimatedModal>
  )
}
