import { ETHERSCAN_BASE_URL } from '@buildeross/constants'
import { useTokenBalances } from '@buildeross/hooks/useTokenBalances'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { erc20Abi } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import { useFormikContext } from 'formik'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import SmartInput from 'src/components/Fields/SmartInput'
import { TEXT } from 'src/components/Fields/types'
import {
  DropdownSelect,
  SelectOption,
} from 'src/modules/create-proposal/components/DropdownSelect'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { formatEther, formatUnits, getAddress, isAddress } from 'viem'
import { useBalance, useReadContract } from 'wagmi'

import {
  EscrowFormValues,
  NULL_ADDRESS,
  TokenMetadataFormValidated,
} from './EscrowForm.schema'

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
  treasuryBalance, // bigint | undefined
  tokenMetadata, // on-chain ERC20 metadata (may be undefined while loading)
  tokenBalance, // bigint | undefined while loading
  currentTokenAddress, // AddressType | undefined
  isLoading, // boolean
}: {
  selectedTokenOption: TokenOption
  treasuryBalance?: bigint
  tokenMetadata?: { name: string; symbol: string; decimals: number; address: string }
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
      address: NULL_ADDRESS,
    }
  }

  // If we’re still validating, don’t produce an invalid “shell” yet → return null
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

export const TokenSelectionForm: React.FC = () => {
  const formik = useFormikContext<EscrowFormValues>()
  const { treasury } = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const [selectedTokenOption, setSelectedTokenOption] = useState<TokenOption>('')

  useEffect(() => {
    const addr = normalizeAddr(formik.values.tokenAddress)
    if (!addr) {
      setSelectedTokenOption('')
      return
    }

    if (addr === NULL_ADDRESS) {
      setSelectedTokenOption('eth')
      return
    }

    if (isAddress(addr)) {
      setSelectedTokenOption(addr)
      return
    }
  }, [formik.values.tokenAddress])

  // Get treasury token balances
  const { balances: treasuryTokens, isLoading: isLoadingTreasury } = useTokenBalances(
    chain.id,
    treasury
  )

  // Get treasury ETH balance
  const { data: treasuryBalance, isLoading: isLoadingTreasuryBalance } = useBalance({
    address: treasury,
    chainId: chain.id,
  })

  // Get the current token address to validate from formik values
  const currentTokenAddress: AddressType | undefined = useMemo(() => {
    if (selectedTokenOption === 'custom') {
      return formik.values.tokenAddress && isAddress(formik.values.tokenAddress.trim())
        ? getAddress(formik.values.tokenAddress.trim())
        : undefined
    }
    if (selectedTokenOption !== '' && selectedTokenOption !== 'eth') {
      return isAddress(selectedTokenOption) ? getAddress(selectedTokenOption) : undefined
    }
    return undefined
  }, [selectedTokenOption, formik.values.tokenAddress])

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
      treasuryBalance?.value, // only depend on the bigint value
      tokenMetadata,
      tokenBalance,
      currentTokenAddress,
      isValidatingToken,
    ]
  )

  // pull what we need once per render
  const currentMeta = formik.values.tokenMetadata as
    | TokenMetadataFormValidated
    | undefined
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
      setFieldValue('tokenMetadata', undefined)
      return
    }

    // set when fingerprints differ (covers bigint, address case, etc.)
    if (currentFp !== nextFp) {
      setFieldValue('tokenMetadata', nextMeta)
    }
  }, [currentFp, nextFp, nextMeta, setFieldValue])

  // Create dropdown options
  const tokenOptions: SelectOption<TokenOption>[] = useMemo(
    () => [
      {
        value: '' as TokenOption,
        label: 'Select a token...',
      },
      {
        value: 'eth' as TokenOption,
        label: isLoadingTreasuryBalance
          ? 'ETH'
          : `ETH (${formatCryptoVal(formatEther(treasuryBalance?.value ?? 0n))} ETH)`,
      },
      ...(treasuryTokens?.map((token) => {
        const formattedBalance = formatUnits(BigInt(token.balance), token.decimals)
        const formattedValue = formatCryptoVal(formattedBalance)

        return {
          value: normalizeAddr(token.address) as TokenOption,
          label: `${token.name} (${formattedValue} ${token.symbol})`,
          icon: token.logo ? (
            <img src={token.logo} alt={token.symbol} width={20} height={20} />
          ) : undefined,
        }
      }) || []),
      {
        value: 'custom' as TokenOption,
        label: 'Custom Token Address',
      },
    ],
    [treasuryTokens, treasuryBalance?.value, isLoadingTreasuryBalance]
  )

  // Handle dropdown selection change
  const handleTokenOptionChange = useCallback(
    (option: TokenOption) => {
      setSelectedTokenOption(option)

      // Clear existing metadata when changing selection
      if (option === 'eth') {
        // Set null address for ETH
        setFieldValue('tokenAddress', NULL_ADDRESS)
      } else if (typeof option === 'string' && isAddress(option)) {
        // Set the token address in formik when selecting from treasury tokens
        setFieldValue('tokenAddress', option)
      } else {
        // default to undefined
        // Clear the token address for placeholder selection
        setFieldValue('tokenAddress', undefined)
      }
    },
    [setFieldValue]
  )

  return (
    <Stack gap={'x5'}>
      <DropdownSelect
        value={selectedTokenOption}
        onChange={handleTokenOptionChange}
        options={tokenOptions}
        inputLabel="Select Token"
        disabled={isLoadingTreasury}
      />

      {selectedTokenOption === 'custom' && (
        <SmartInput
          type={TEXT}
          formik={formik}
          {...formik.getFieldProps('tokenAddress')}
          id="tokenAddress"
          inputLabel="Custom Token Address"
          placeholder="0x..."
          isAddress={true}
          errorMessage={
            formik.touched.tokenAddress && formik.errors.tokenAddress
              ? formik.errors.tokenAddress
              : formik.values.tokenAddress &&
                  isAddress(formik.values.tokenAddress.trim()) &&
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
            fullTokenMetadata.address === NULL_ADDRESS
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
