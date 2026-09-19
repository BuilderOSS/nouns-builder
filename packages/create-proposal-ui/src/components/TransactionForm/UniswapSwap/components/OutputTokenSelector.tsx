import { NATIVE_TOKEN_ADDRESS } from '@buildeross/constants/addresses'
import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { usePopularTokens, useTokenMetadataSingle } from '@buildeross/hooks'
import { useChainStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { DropdownSelect, SelectOption } from '@buildeross/ui/DropdownSelect'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import type { FormikProps } from 'formik'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { type Address, getAddress, isAddress } from 'viem'

import type { UniswapSwapFormValues } from '../UniswapSwap.schema'

interface OutputTokenSelectorProps {
  formik: FormikProps<UniswapSwapFormValues>
  excludeTokenAddress?: string
}

type TokenOption = '' | Address | 'custom'

const normalizeAddr = (a?: AddressType | string | null): string =>
  a ? String(a).trim().toLowerCase() : ''

const isNativeEth = (address?: Address | string | null): boolean => {
  if (!address) return false
  const normalized = normalizeAddr(address)
  return normalized === normalizeAddr(NATIVE_TOKEN_ADDRESS)
}

export const OutputTokenSelector: React.FC<OutputTokenSelectorProps> = ({
  formik,
  excludeTokenAddress,
}) => {
  const { id: chainId } = useChainStore((s) => s.chain)
  const { values, setFieldValue, errors, touched } = formik

  const [selectedTokenOption, setSelectedTokenOption] = useState<TokenOption>('')
  const [resolvedAddress, setResolvedAddress] = useState<Address | undefined>()
  const [isResolving, setIsResolving] = useState(false)

  // Fetch popular tokens for this chain
  const { tokens: popularTokens, isLoading: isLoadingTokens } = usePopularTokens(chainId)

  // Sync selected option from formik values
  useEffect(() => {
    const addr = normalizeAddr(values.outputTokenAddress)
    if (!addr) {
      // Don't overwrite selectedTokenOption when it's 'custom' and address is being cleared
      if (selectedTokenOption !== 'custom') {
        setSelectedTokenOption('')
      }
      return
    }

    if (isAddress(addr)) {
      // Check if it's one of the popular tokens
      const isPopular = popularTokens.some((t) => normalizeAddr(t.address) === addr)
      setSelectedTokenOption(isPopular ? (addr as Address) : 'custom')
      return
    }

    setSelectedTokenOption('custom')
  }, [values.outputTokenAddress, popularTokens, selectedTokenOption])

  // Get the current token address to validate
  const currentTokenAddress: Address | undefined = useMemo(() => {
    if (selectedTokenOption === 'custom') {
      return resolvedAddress
    }
    if (selectedTokenOption !== '' && isAddress(selectedTokenOption)) {
      return getAddress(selectedTokenOption)
    }
    return undefined
  }, [selectedTokenOption, resolvedAddress])

  // Check if the current token is native ETH
  const isNativeToken = useMemo(
    () => isNativeEth(currentTokenAddress),
    [currentTokenAddress]
  )

  // Resolve ENS name to address for custom input
  useEffect(() => {
    const resolveAddress = async () => {
      if (selectedTokenOption !== 'custom') {
        setResolvedAddress(undefined)
        return
      }

      const inputValue = values.outputTokenAddress?.trim()
      if (!inputValue) {
        setResolvedAddress(undefined)
        setFieldValue('outputTokenMetadata', undefined)
        return
      }

      // Check if it's already a valid address
      if (isAddress(inputValue)) {
        setResolvedAddress(inputValue as Address)
        return
      }

      // Try to resolve ENS name
      setIsResolving(true)
      try {
        const resolved = await getEnsAddress(inputValue)
        if (resolved && isAddress(resolved)) {
          setResolvedAddress(resolved as Address)
        } else {
          setResolvedAddress(undefined)
          setFieldValue('outputTokenMetadata', undefined)
        }
      } catch (error) {
        console.error('Error resolving ENS:', error)
        setResolvedAddress(undefined)
        setFieldValue('outputTokenMetadata', undefined)
      } finally {
        setIsResolving(false)
      }
    }

    resolveAddress()
  }, [selectedTokenOption, values.outputTokenAddress, setFieldValue])

  // Fetch token metadata for the selected/resolved address (skip for native ETH)
  const { tokenMetadata, isLoading: isLoadingMetadata } = useTokenMetadataSingle(
    chainId,
    isNativeToken ? undefined : currentTokenAddress
  )

  // Update form when metadata loads or when native ETH is selected
  // Mirrors the approach from TokenSelectionForm: return null while loading,
  // only mark as invalid after validation completes
  useEffect(() => {
    // Handle native ETH with hardcoded metadata
    if (isNativeToken && currentTokenAddress) {
      setFieldValue('outputTokenMetadata', {
        address: currentTokenAddress,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        balance: 0n, // Output token balance not relevant for proposals
        isValid: true,
      })
      return
    }

    // If we're still validating, don't produce an invalid "shell" yet
    // This prevents marking tokens as invalid while metadata is loading
    if (isLoadingMetadata || isResolving || !currentTokenAddress) {
      // Don't set metadata to invalid - just wait
      return
    }

    // We have a resolved metadata - mark as valid
    if (tokenMetadata && currentTokenAddress) {
      const addr = normalizeAddr(currentTokenAddress)
      const tokenAddress = normalizeAddr(tokenMetadata.address)

      if (tokenAddress === addr && !!tokenMetadata.symbol) {
        setFieldValue('outputTokenMetadata', {
          address: currentTokenAddress,
          name: tokenMetadata.name,
          symbol: tokenMetadata.symbol,
          decimals: tokenMetadata.decimals,
          balance: 0n, // Output token balance not relevant for proposals
          isValid: true,
        })
        return
      }
    }

    // Validation finished, address present, but no metadata → invalid token
    setFieldValue('outputTokenMetadata', {
      address: currentTokenAddress,
      name: '',
      symbol: '',
      decimals: 0,
      balance: 0n,
      isValid: false,
    })
  }, [
    tokenMetadata,
    currentTokenAddress,
    isLoadingMetadata,
    isResolving,
    isNativeToken,
    setFieldValue,
  ])

  // Create dropdown options
  const tokenOptions: SelectOption<TokenOption>[] = useMemo(() => {
    // Normalize the excluded address for comparison
    const normalizedExclude = normalizeAddr(excludeTokenAddress)

    const options: SelectOption<TokenOption>[] = [
      {
        value: '' as TokenOption,
        label:
          values.swapDirection === 'buy'
            ? 'Select the token you want to acquire...'
            : 'Select the token you will receive...',
      },
    ]

    // Add popular tokens that are not excluded
    if (popularTokens) {
      options.push(
        ...popularTokens
          .filter((token) => {
            if (!normalizedExclude) return true
            return normalizeAddr(token.address) !== normalizedExclude
          })
          .map((token) => ({
            value: normalizeAddr(token.address) as TokenOption,
            label: `${token.symbol}${token.isNative ? ' (Native)' : ''} - ${token.name}`,
            icon: token.logoURI ? (
              <img src={token.logoURI} alt={token.symbol} width={20} height={20} />
            ) : undefined,
          }))
      )
    }

    // Always add custom option
    options.push({
      value: 'custom' as TokenOption,
      label: 'Custom Token Address',
    })

    return options
  }, [popularTokens, values.swapDirection, excludeTokenAddress])

  // Handle dropdown selection change
  const handleTokenOptionChange = useCallback(
    (option: TokenOption) => {
      setSelectedTokenOption(option)

      if (option === 'custom') {
        // Clear the token address for custom input
        setFieldValue('outputTokenAddress', '')
        setFieldValue('outputTokenMetadata', undefined)
      } else if (typeof option === 'string' && isAddress(option)) {
        // Set the token address when selecting from popular tokens
        setFieldValue('outputTokenAddress', option)
      } else {
        // Clear for placeholder selection
        setFieldValue('outputTokenAddress', '')
        setFieldValue('outputTokenMetadata', undefined)
      }
    },
    [setFieldValue]
  )

  const isValid = !!values.outputTokenMetadata?.isValid
  const showMetadata = isValid && !isLoadingMetadata && !isResolving
  // Don't show validating state for native ETH
  const isValidating = !isNativeToken && (isLoadingMetadata || isResolving)

  return (
    <Stack gap="x5">
      <DropdownSelect
        value={selectedTokenOption}
        onChange={handleTokenOptionChange}
        options={tokenOptions}
        inputLabel={values.swapDirection === 'buy' ? 'Token to Buy' : 'Receive Token'}
        disabled={isLoadingTokens}
        isLoading={isLoadingTokens}
        positioning="absolute"
      />

      {selectedTokenOption === 'custom' && (
        <SmartInput
          type={FIELD_TYPES.TEXT}
          formik={formik}
          {...formik.getFieldProps('outputTokenAddress')}
          id="outputTokenAddress"
          inputLabel="Custom Token Address"
          placeholder="0x... or ENS name"
          isAddress={true}
          errorMessage={
            touched.outputTokenAddress ? (errors.outputTokenAddress as string) : undefined
          }
        />
      )}

      {/* Resolving ENS */}
      {isResolving && selectedTokenOption === 'custom' && (
        <Box p="x3" backgroundColor="background2" borderRadius="curved">
          <Text fontSize="14" color="text3">
            Resolving address...
          </Text>
        </Box>
      )}

      {/* Loading metadata */}
      {isValidating && currentTokenAddress && !isResolving && (
        <Box
          p="x4"
          backgroundColor="background2"
          borderRadius="curved"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="border"
        >
          <Flex direction="column" gap="x2">
            <Text fontWeight="label" fontSize={16}>
              Validating Token...
            </Text>
            <Text fontSize={14} color="text3">
              Checking token metadata
            </Text>
          </Flex>
        </Box>
      )}

      {/* Valid token display */}
      {showMetadata && currentTokenAddress && (
        <Box
          as="a"
          href={`${ETHERSCAN_BASE_URL[chainId as keyof typeof ETHERSCAN_BASE_URL]}/token/${currentTokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          p="x4"
          backgroundColor="positive"
          borderRadius="curved"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="positive"
          style={{
            textDecoration: 'none',
            display: 'block',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          <Flex direction="column" gap="x1">
            <Text fontSize={14} fontWeight="label" color="onPositive">
              {values.outputTokenMetadata?.name} ({values.outputTokenMetadata?.symbol})
            </Text>
            <Text fontSize={12} color="onPositive" fontFamily="mono">
              {currentTokenAddress}
            </Text>
            <Text fontSize={12} color="onPositive">
              Decimals: {values.outputTokenMetadata?.decimals}
            </Text>
          </Flex>
        </Box>
      )}

      {/* Invalid token error */}
      {!isValid &&
        !isResolving &&
        !isLoadingMetadata &&
        values.outputTokenAddress &&
        currentTokenAddress && (
          <Box
            p="x4"
            borderRadius="phat"
            borderWidth="normal"
            borderStyle="solid"
            borderColor="negative"
          >
            <Stack gap="x2">
              <Text fontWeight="label" fontSize={16}>
                ❌ Invalid Token
              </Text>
              <Text fontSize={14}>
                Unable to resolve token address. Please check and try again.
              </Text>
            </Stack>
          </Box>
        )}
    </Stack>
  )
}
