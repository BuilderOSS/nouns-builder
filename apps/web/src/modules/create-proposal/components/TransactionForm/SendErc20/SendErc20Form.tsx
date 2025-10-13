import { ETHERSCAN_BASE_URL } from '@buildeross/constants'
import { useTokenBalances } from '@buildeross/hooks/useTokenBalances'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { erc20Abi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { DropdownSelect, SelectOption } from '@buildeross/ui/DropdownSelect'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import type { FormikProps } from 'formik'
import { Form } from 'formik'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatUnits, getAddress, isAddress } from 'viem'
import { useReadContract } from 'wagmi'

import { SendErc20Values, TokenMetadataFormValidated } from './SendErc20.schema'

type TokenOption = '' | 'custom' | AddressType

interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
  balance: bigint
  isValid: boolean
  address: AddressType
}

interface SendErc20FormProps {
  formik: FormikProps<SendErc20Values>
}

const normalizeAddr = (a?: AddressType | string | null): string =>
  a ? String(a).trim().toLowerCase() : ''

const SEP = '\x1F'

const toFingerprint = (m?: TokenMetadata | null) =>
  !m
    ? 'null'
    : [
        m.name ?? '',
        m.symbol ?? '',
        String(m.decimals ?? ''),
        (m.balance ?? 0n).toString(),
        String(m.isValid ?? false),
        normalizeAddr(m.address),
      ].join(SEP)

const computeTokenMetadata = ({
  tokenMetadata,
  tokenBalance,
  currentTokenAddress,
  isLoading,
}: {
  tokenMetadata?: { name: string; symbol: string; decimals: number; address: string }
  tokenBalance?: bigint
  currentTokenAddress?: AddressType
  isLoading: boolean
}): TokenMetadata | null => {
  if (isLoading || !currentTokenAddress) {
    return null
  }

  const addr = normalizeAddr(currentTokenAddress)
  const tokenAddress = normalizeAddr(tokenMetadata?.address)

  if (tokenMetadata && tokenAddress === addr && !!tokenMetadata.symbol) {
    return {
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      decimals: tokenMetadata.decimals,
      balance: tokenBalance ?? 0n,
      isValid: true,
      address: addr as AddressType,
    }
  }

  return {
    name: '',
    symbol: '',
    decimals: 0,
    balance: 0n,
    isValid: false,
    address: addr as AddressType,
  }
}

export const SendErc20Form = ({ formik }: SendErc20FormProps) => {
  const { treasury } = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const [selectedTokenOption, setSelectedTokenOption] = useState<TokenOption>('')

  useEffect(() => {
    const addr = normalizeAddr(formik.values.tokenAddress)
    if (!addr) {
      setSelectedTokenOption('')
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

  // Get the current token address to validate from formik values
  const currentTokenAddress: AddressType | undefined = useMemo(() => {
    if (selectedTokenOption === 'custom') {
      return formik.values.tokenAddress && isAddress(formik.values.tokenAddress.trim())
        ? getAddress(formik.values.tokenAddress.trim())
        : undefined
    }
    if (selectedTokenOption !== '') {
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
      enabled: !!currentTokenAddress && !!treasury && !!tokenMetadata,
    },
  })

  const isValidatingToken = useMemo(
    () => !!currentTokenAddress && isLoadingTokenMetadata,
    [currentTokenAddress, isLoadingTokenMetadata]
  )

  const fullTokenMetadata: TokenMetadata | null = useMemo(
    () =>
      computeTokenMetadata({
        tokenMetadata: tokenMetadata,
        tokenBalance,
        currentTokenAddress: currentTokenAddress,
        isLoading: isValidatingToken,
      }),
    [tokenMetadata, tokenBalance, currentTokenAddress, isValidatingToken]
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
      ...(treasuryTokens?.map((token) => {
        const formattedBalance = formatUnits(BigInt(token.balance), token.decimals)
        const formattedValue = formatCryptoVal(formattedBalance)

        return {
          value: token.address as TokenOption,
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
    [treasuryTokens]
  )

  // Handle dropdown selection change
  const handleTokenOptionChange = useCallback(
    (option: TokenOption) => {
      setSelectedTokenOption(option)

      if (option === 'custom') {
        // Clear the token address for custom input
        formik.setFieldValue('tokenAddress', '')
      } else if (typeof option === 'string' && isAddress(option)) {
        // Set the token address in formik when selecting from treasury tokens
        formik.setFieldValue('tokenAddress', option)
      } else {
        // Clear the token address for placeholder selection
        formik.setFieldValue('tokenAddress', '')
      }
    },
    [formik]
  )

  const currentBalance = useMemo(
    () =>
      fullTokenMetadata
        ? parseFloat(formatUnits(fullTokenMetadata.balance, fullTokenMetadata.decimals))
        : 0,
    [fullTokenMetadata]
  )

  const amountExceedsBalanceError = useMemo(() => {
    if (!formik.values.amount || !fullTokenMetadata?.isValid) {
      return undefined
    }
    const exceedsBalance =
      formik.values.amount >
      parseFloat(formatUnits(fullTokenMetadata.balance, fullTokenMetadata.decimals))

    const balanceString = `${formatCryptoVal(
      formatUnits(fullTokenMetadata.balance, fullTokenMetadata.decimals)
    )} ${fullTokenMetadata.symbol}`

    if (exceedsBalance) {
      return `Amount exceeds treasury balance of ${balanceString}`
    }

    return undefined
  }, [fullTokenMetadata, formik.values.amount])

  return (
    <Box
      data-testid="send-erc20-form"
      as={'fieldset'}
      disabled={formik.isValidating || formik.isSubmitting}
      style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
    >
      <Stack as={Form} gap={'x5'}>
        <DropdownSelect
          value={selectedTokenOption}
          onChange={handleTokenOptionChange}
          options={tokenOptions}
          inputLabel="Select Token"
          disabled={isLoadingTreasury}
        />

        {selectedTokenOption === 'custom' && (
          <SmartInput
            type={FIELD_TYPES.TEXT}
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
        {isValidatingToken && currentTokenAddress && (
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
            href={`${ETHERSCAN_BASE_URL[chain.id]}/token/${fullTokenMetadata.address}?a=${treasury}`}
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

        <SmartInput
          type={FIELD_TYPES.TEXT}
          formik={formik}
          {...formik.getFieldProps('recipientAddress')}
          id="recipientAddress"
          inputLabel={'Recipient Wallet Address/ENS'}
          placeholder={'0x...'}
          isAddress={true}
          errorMessage={
            formik.touched.recipientAddress && formik.errors.recipientAddress
              ? formik.errors.recipientAddress
              : undefined
          }
        />

        <SmartInput
          {...formik.getFieldProps(`amount`)}
          inputLabel="Amount"
          secondaryLabel={
            fullTokenMetadata
              ? `Max: ${formatCryptoVal(
                  formatUnits(fullTokenMetadata.balance, fullTokenMetadata.decimals)
                )} ${fullTokenMetadata.symbol}`
              : undefined
          }
          id={`amount`}
          type={FIELD_TYPES.NUMBER}
          placeholder={'100'}
          min={0}
          max={currentBalance}
          errorMessage={
            !formik.touched.amount
              ? undefined
              : formik.errors.amount || amountExceedsBalanceError
          }
        />

        <Button
          variant={'outline'}
          borderRadius={'curved'}
          type="submit"
          disabled={
            !formik.isValid ||
            !fullTokenMetadata?.isValid ||
            formik.isSubmitting ||
            !!amountExceedsBalanceError
          }
        >
          {formik.isSubmitting
            ? 'Adding Transaction to Queue...'
            : 'Add Transaction to Queue'}
        </Button>
      </Stack>
    </Box>
  )
}
