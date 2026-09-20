import { ETHERSCAN_BASE_URL } from '@buildeross/constants'
import { PUBLIC_IS_TESTNET } from '@buildeross/constants/chains'
import { useEthUsdPrice } from '@buildeross/hooks'
import { useTokenBalances } from '@buildeross/hooks/useTokenBalances'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { erc20Abi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { DropdownSelect, SelectOption } from '@buildeross/ui/DropdownSelect'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { NATIVE_TOKEN_ADDRESS } from '@buildeross/utils/escrow'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal, formatUsd } from '@buildeross/utils/numbers'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import { useFormikContext } from 'formik'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatEther, formatUnits, getAddress, isAddress } from 'viem'
import { useBalance, useReadContract } from 'wagmi'

export interface TokenMetadataFormValidated {
  name: string
  symbol: string
  decimals: number
  balance: bigint
  isValid: boolean
  address: AddressType
}

export interface TokenSelectionFormValues {
  tokenAddress?: AddressType
  tokenMetadata?: TokenMetadataFormValidated
}

interface TokenSelectionFormProps {
  addressFieldName?: string
  metadataFieldName?: string
  label?: string
  placeholder?: string
  excludeTokenAddress?: string
}

type TokenOption = '' | 'eth' | AddressType | 'custom'

const normalizeAddr = (a?: AddressType | string | null): string =>
  a ? String(a).trim().toLowerCase() : ''

const SEP = '\x1F'

const toFingerprint = (m?: TokenMetadataFormValidated | null) =>
  !m
    ? 'null'
    : [
        m.name ?? '',
        m.symbol ?? '',
        String(m.decimals ?? ''),
        // bigint-safe
        (m.balance ?? 0n).toString(),
        String(m.isValid ?? false),
        normalizeAddr(m.address),
      ].join(SEP)

const computeTokenMetadata = ({
  selectedTokenOption,
  treasuryBalance,
  tokenMetadata,
  tokenBalance,
  currentTokenAddress,
  isLoading,
}: {
  selectedTokenOption: TokenOption
  treasuryBalance?: bigint
  tokenMetadata?: {
    name: string
    symbol: string
    decimals: number
    address: string
  } | null
  tokenBalance?: bigint
  currentTokenAddress?: AddressType
  isLoading: boolean
}): TokenMetadataFormValidated | null => {
  // ETH branch: address is the zero/null address; validity does not depend on balance existing
  if (selectedTokenOption === 'eth') {
    return {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      balance: treasuryBalance ?? 0n,
      isValid: true,
      address: normalizeAddr(NATIVE_TOKEN_ADDRESS) as AddressType,
    }
  }

  // If we're still validating, don't produce an invalid "shell" yet → return null
  if (isLoading || !currentTokenAddress) {
    return null
  }

  // ERC20 branch (explicitly not ETH)
  const addr = normalizeAddr(currentTokenAddress)
  const tokenAddress = normalizeAddr(tokenMetadata?.address)

  // We have a resolved metadata + (possibly still fetching) balance
  if (tokenMetadata && tokenAddress === addr && !!tokenMetadata.symbol) {
    return {
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      decimals: tokenMetadata.decimals,
      balance: tokenBalance ?? 0n, // show 0n while balance fetch resolves
      isValid: true,
      address: addr as AddressType,
    }
  }

  // Validation finished, address present, but no metadata → invalid token
  return {
    name: '',
    symbol: '',
    decimals: 0,
    balance: 0n,
    isValid: false,
    address: addr as AddressType,
  }
}

export const TokenSelectionForm: React.FC<TokenSelectionFormProps> = ({
  addressFieldName = 'tokenAddress',
  metadataFieldName = 'tokenMetadata',
  label = 'Select Token',
  placeholder = 'Select a token...',
  excludeTokenAddress,
}) => {
  const formik = useFormikContext<any>()
  const { treasury } = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const [selectedTokenOption, setSelectedTokenOption] = useState<TokenOption>('')

  // Extract field values to satisfy React hooks dependencies
  const tokenAddressValue = formik.values[addressFieldName]
  const tokenMetadataValue = formik.values[metadataFieldName]

  // Get ETH/USD price for calculating ETH value
  const { price: ethUsdPrice } = useEthUsdPrice()

  useEffect(() => {
    const addr = normalizeAddr(tokenAddressValue)
    if (!addr) {
      setSelectedTokenOption('')
      return
    }

    if (addr === normalizeAddr(NATIVE_TOKEN_ADDRESS)) {
      setSelectedTokenOption('eth')
      return
    }

    if (isAddress(addr)) {
      setSelectedTokenOption(addr)
      return
    }
  }, [tokenAddressValue])

  // Get treasury token balances
  const { balances: treasuryTokens, isLoading: isLoadingTreasury } = useTokenBalances(
    chain.id,
    treasury,
    { filterLowValue: !PUBLIC_IS_TESTNET }
  )

  // Get treasury ETH balance
  const { data: treasuryBalance, isLoading: isLoadingTreasuryBalance } = useBalance({
    address: treasury,
    chainId: chain.id,
  })

  // Get the current token address to validate from formik values
  const currentTokenAddress: AddressType | undefined = useMemo(() => {
    if (selectedTokenOption === 'custom') {
      return tokenAddressValue && isAddress(tokenAddressValue.trim())
        ? getAddress(tokenAddressValue.trim())
        : undefined
    }
    if (selectedTokenOption !== '' && selectedTokenOption !== 'eth') {
      return isAddress(selectedTokenOption) ? getAddress(selectedTokenOption) : undefined
    }
    return undefined
  }, [selectedTokenOption, tokenAddressValue])

  // Get token metadata using the common hook
  const { tokenMetadata, isLoading: isLoadingTokenMetadata } = useTokenMetadataSingle(
    chain.id,
    currentTokenAddress
  )

  // Token balance check using useReadContract (only for ERC20 tokens)
  const { data: tokenBalance } = useReadContract({
    address: currentTokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [treasury as `0x${string}`],
    chainId: chain.id,
    query: {
      enabled:
        !!currentTokenAddress &&
        !!treasury &&
        !!tokenMetadata &&
        selectedTokenOption !== 'eth',
    },
  })

  const isValidatingToken = useMemo(
    () =>
      !!currentTokenAddress && selectedTokenOption !== 'eth' && isLoadingTokenMetadata,
    [currentTokenAddress, selectedTokenOption, isLoadingTokenMetadata]
  )

  const fullTokenMetadata: TokenMetadataFormValidated | null = useMemo(
    () =>
      computeTokenMetadata({
        selectedTokenOption,
        treasuryBalance: treasuryBalance?.value,
        tokenMetadata: tokenMetadata,
        tokenBalance,
        currentTokenAddress: currentTokenAddress,
        isLoading: isValidatingToken,
      }),
    [
      selectedTokenOption,
      treasuryBalance?.value,
      tokenMetadata,
      tokenBalance,
      currentTokenAddress,
      isValidatingToken,
    ]
  )

  // pull what we need once per render
  const currentMeta = tokenMetadataValue as TokenMetadataFormValidated | undefined
  const nextMeta = fullTokenMetadata ?? undefined
  const currentFp = toFingerprint(currentMeta)
  const nextFp = toFingerprint(nextMeta)
  const setFieldValue = formik.setFieldValue

  // Update Formik only when the metadata meaningfully changes
  useEffect(() => {
    // nothing to set and nothing stored → no-op
    if (nextFp === 'null' && currentFp === 'null') return

    // clear when next is null (use undefined for the field)
    if (nextFp === 'null') {
      setFieldValue(metadataFieldName, undefined)
      return
    }

    // set when fingerprints differ (covers bigint, address case, etc.)
    if (currentFp !== nextFp) {
      setFieldValue(metadataFieldName, nextMeta)
    }
  }, [currentFp, nextFp, nextMeta, setFieldValue, metadataFieldName])

  // Create dropdown options
  const tokenOptions: SelectOption<TokenOption>[] = useMemo(() => {
    // Normalize the excluded address for comparison
    const normalizedExclude = normalizeAddr(excludeTokenAddress)

    // Sort treasury tokens by USD value descending
    const sortedTreasuryTokens = (treasuryTokens ?? []).sort((a, b) => {
      const aUsd = Number(a.valueInUSD) || 0
      const bUsd = Number(b.valueInUSD) || 0
      return bUsd - aUsd
    })

    // Calculate ETH USD value
    const ethUsdValue =
      ethUsdPrice && treasuryBalance?.value
        ? Number(formatEther(treasuryBalance.value)) * ethUsdPrice
        : 0

    // Check if ETH should be excluded
    const isEthExcluded =
      normalizedExclude && normalizedExclude === normalizeAddr(NATIVE_TOKEN_ADDRESS)

    const options: SelectOption<TokenOption>[] = [
      {
        value: '' as TokenOption,
        label: placeholder,
      },
    ]

    // Add ETH option if not excluded
    if (!isEthExcluded) {
      options.push({
        value: 'eth' as TokenOption,
        label: isLoadingTreasuryBalance
          ? 'ETH'
          : `ETH (${formatCryptoVal(formatEther(treasuryBalance?.value ?? 0n))} ETH)`,
        description: isLoadingTreasuryBalance
          ? walletSnippet(NATIVE_TOKEN_ADDRESS)
          : ethUsdValue > 0
            ? `${formatUsd(ethUsdValue)} · ${walletSnippet(NATIVE_TOKEN_ADDRESS)}`
            : walletSnippet(NATIVE_TOKEN_ADDRESS),
      })
    }

    // Add treasury tokens that are not excluded
    options.push(
      ...sortedTreasuryTokens
        .filter((token) => {
          if (!normalizedExclude) return true
          return normalizeAddr(token.address) !== normalizedExclude
        })
        .map((token) => {
          const formattedBalance = formatUnits(BigInt(token.balance), token.decimals)
          const formattedValue = formatCryptoVal(formattedBalance)
          const tokenUsdValue = Number(token.valueInUSD) || 0

          return {
            value: normalizeAddr(token.address) as TokenOption,
            label: `${token.name} (${formattedValue} ${token.symbol})`,
            description:
              tokenUsdValue > 0
                ? `${formatUsd(tokenUsdValue)} · ${walletSnippet(token.address)}`
                : walletSnippet(token.address),
            icon: token.logo ? (
              <img src={token.logo} alt={token.symbol} width={20} height={20} />
            ) : undefined,
          }
        })
    )

    // Always add custom option
    options.push({
      value: 'custom' as TokenOption,
      label: 'Custom Token Address',
    })

    return options
  }, [
    treasuryTokens,
    treasuryBalance?.value,
    isLoadingTreasuryBalance,
    ethUsdPrice,
    placeholder,
    excludeTokenAddress,
  ])

  // Handle dropdown selection change
  const handleTokenOptionChange = useCallback(
    (option: TokenOption) => {
      setSelectedTokenOption(option)

      // Clear existing metadata when changing selection
      if (option === 'eth') {
        // Set null address for ETH
        setFieldValue(addressFieldName, NATIVE_TOKEN_ADDRESS)
      } else if (typeof option === 'string' && isAddress(option)) {
        // Set the token address in formik when selecting from treasury tokens
        setFieldValue(addressFieldName, option)
      } else {
        // default to undefined
        // Clear the token address for placeholder selection
        setFieldValue(addressFieldName, undefined)
      }
    },
    [setFieldValue, addressFieldName]
  )

  return (
    <Stack gap={'x5'}>
      <DropdownSelect
        value={selectedTokenOption}
        onChange={handleTokenOptionChange}
        options={tokenOptions}
        inputLabel={label}
        disabled={isLoadingTreasury}
        isLoading={isLoadingTreasury}
        positioning="absolute"
        searchable={true}
        searchPlaceholder="Search tokens..."
      />

      {selectedTokenOption === 'custom' && (
        <SmartInput
          type={FIELD_TYPES.TEXT}
          formik={formik}
          {...formik.getFieldProps(addressFieldName)}
          id={addressFieldName}
          inputLabel="Custom Token Address"
          placeholder="0x..."
          isAddress={true}
          errorMessage={
            formik.touched[addressFieldName] && formik.errors[addressFieldName]
              ? formik.errors[addressFieldName]
              : tokenAddressValue &&
                  isAddress(tokenAddressValue.trim()) &&
                  !isValidatingToken &&
                  fullTokenMetadata?.isValid === false
                ? 'Invalid ERC20 token or contract not found'
                : undefined
          }
        />
      )}

      {/* Token validation loading state */}
      {isValidatingToken && currentTokenAddress && selectedTokenOption !== 'eth' && (
        <Box
          p={'x4'}
          backgroundColor={'background2'}
          borderRadius={'curved'}
          borderWidth={'normal'}
          borderStyle={'solid'}
          borderColor={'border'}
        >
          <Flex direction={'column'} gap={'x2'}>
            <Text fontWeight={'label'} fontSize={16}>
              Validating Token...
            </Text>
            <Text fontSize={14} color={'text3'}>
              Checking token metadata and treasury balance
            </Text>
          </Flex>
        </Box>
      )}

      {/* Valid token metadata display */}
      {fullTokenMetadata && fullTokenMetadata.isValid && (
        <Box
          as="a"
          href={
            fullTokenMetadata.address === normalizeAddr(NATIVE_TOKEN_ADDRESS)
              ? `${ETHERSCAN_BASE_URL[chain.id]}/address/${treasury}`
              : `${ETHERSCAN_BASE_URL[chain.id]}/token/${fullTokenMetadata.address}?a=${treasury}`
          }
          target={'_blank'}
          rel={'noopener noreferrer'}
          p={'x4'}
          backgroundColor={'background2'}
          borderRadius={'curved'}
          borderWidth={'normal'}
          borderStyle={'solid'}
          borderColor={'border'}
          style={{
            textDecoration: 'none',
            display: 'block',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          <Flex direction={'column'} gap={'x1'}>
            <Text fontSize={14} fontWeight={'label'}>
              {fullTokenMetadata.name} ({fullTokenMetadata.symbol})
            </Text>
            <Text fontSize={14} color={'text3'}>
              Treasury Balance:{' '}
              {formatCryptoVal(
                formatUnits(fullTokenMetadata.balance, fullTokenMetadata.decimals)
              )}{' '}
              {fullTokenMetadata.symbol}
            </Text>
            <Text fontSize={12} color={'text4'}>
              Decimals: {fullTokenMetadata.decimals}
            </Text>
          </Flex>
        </Box>
      )}

      {/* Invalid token error state */}
      {fullTokenMetadata &&
        fullTokenMetadata.isValid === false &&
        currentTokenAddress &&
        isAddress(currentTokenAddress) && (
          <Box
            p={'x4'}
            backgroundColor={'background2'}
            borderRadius={'curved'}
            borderWidth={'normal'}
            borderStyle={'solid'}
            borderColor={'negative'}
          >
            <Flex direction={'column'} gap={'x2'}>
              <Text fontWeight={'label'} fontSize={16} color={'negative'}>
                Invalid Token
              </Text>
              <Text fontSize={14} color={'text3'}>
                This address is not a valid ERC20 token or the contract could not be
                found.
              </Text>
            </Flex>
          </Box>
        )}
    </Stack>
  )
}
