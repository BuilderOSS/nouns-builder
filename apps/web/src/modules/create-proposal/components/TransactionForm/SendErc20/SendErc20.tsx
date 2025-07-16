import { Box, Button, Flex, Text } from '@buildeross/zord'
import { Form, Formik } from 'formik'
import type { FormikHelpers, FormikProps } from 'formik'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { encodeFunctionData, formatUnits, getAddress, isAddress, parseUnits } from 'viem'
import { useReadContracts } from 'wagmi'

import SmartInput from 'src/components/Fields/SmartInput'
import { NUMBER, TEXT } from 'src/components/Fields/types'
import { ETHERSCAN_BASE_URL } from 'src/constants/etherscan'
import { erc20Abi } from 'src/data/contract/abis/ERC20'
import { useTokenBalances } from 'src/hooks/useTokenBalances'
import { useTokenMetadataSingle } from 'src/hooks/useTokenMetadata'
import { TransactionType, useProposalStore } from 'src/modules/create-proposal'
import {
  DropdownSelect,
  SelectOption,
} from 'src/modules/create-proposal/components/DropdownSelect'
import { useDaoStore } from 'src/modules/dao'
import { useChainStore } from 'src/stores/useChainStore'
import { CHAIN_ID } from 'src/typings'
import { getEnsAddress } from 'src/utils/ens'
import { walletSnippet } from 'src/utils/helpers'
import { formatCryptoVal } from 'src/utils/numbers'
import { getProvider } from 'src/utils/provider'

import sendErc20Schema, { SendErc20Values } from './SendErc20.schema'

type TokenOption = 'treasury-tokens' | 'custom' | string

interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
  balance: bigint
  isValid: boolean
}

interface SendErc20FormProps {
  formik: FormikProps<SendErc20Values>
  onTokenMetadataChange: (metadata: TokenMetadata | null) => void
}

const SendErc20Form = ({ formik, onTokenMetadataChange }: SendErc20FormProps) => {
  const { treasury } = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const [selectedTokenOption, setSelectedTokenOption] = useState<TokenOption>('')
  const [currentTokenMetadata, setCurrentTokenMetadata] = useState<TokenMetadata | null>(
    null
  )

  // Get treasury token balances
  const { balances: treasuryTokens, isLoading: isLoadingTreasury } = useTokenBalances(
    chain.id,
    treasury
  )

  // Get the current token address to validate from formik values
  const currentTokenAddress = useMemo(() => {
    if (selectedTokenOption === 'custom') {
      return formik.values.tokenAddress || ''
    }
    if (selectedTokenOption !== '' && selectedTokenOption !== 'custom') {
      return selectedTokenOption
    }
    return ''
  }, [selectedTokenOption, formik.values.tokenAddress])

  // Get token metadata using the common hook
  const { tokenMetadata, isLoading: isLoadingTokenMetadata } = useTokenMetadataSingle(
    chain.id,
    currentTokenAddress as `0x${string}`
  )

  // Token balance check using useReadContracts (only for balance)
  const { data: tokenData, isLoading: isValidatingToken } = useReadContracts({
    contracts: [
      {
        address: currentTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [treasury as `0x${string}`],
        chainId: chain.id,
      },
    ],
    allowFailure: false,
    query: {
      enabled: isAddress(currentTokenAddress) && !!treasury && !!tokenMetadata,
    },
  })

  // Update token metadata when token data changes
  useEffect(() => {
    if (tokenMetadata && tokenData && currentTokenAddress) {
      const balance = tokenData[0] // balance from balanceOf call

      const metadata = {
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        decimals: tokenMetadata.decimals,
        balance,
        isValid: true,
      }

      setCurrentTokenMetadata(metadata)
      onTokenMetadataChange(metadata)
    } else if (currentTokenAddress && !isValidatingToken && !isLoadingTokenMetadata) {
      // If we have a token address but no data and not loading, it's invalid
      const metadata = {
        name: '',
        symbol: '',
        decimals: 0,
        balance: 0n,
        isValid: false,
      }

      setCurrentTokenMetadata(metadata)
      onTokenMetadataChange(metadata)
    }
  }, [
    tokenData,
    tokenMetadata,
    currentTokenAddress,
    isValidatingToken,
    isLoadingTokenMetadata,
    onTokenMetadataChange,
    chain.id,
    chain.name,
  ])

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
      // Clear existing metadata when changing selection
      setCurrentTokenMetadata(null)
      onTokenMetadataChange(null)

      if (option === 'custom') {
        // Clear the token address when switching to custom
        formik.setFieldValue('tokenAddress', '')
      } else if (option !== '' && option !== 'custom') {
        // Set the token address in formik when selecting from treasury tokens
        formik.setFieldValue('tokenAddress', option)
      } else {
        // Clear the token address for placeholder selection
        formik.setFieldValue('tokenAddress', '')
      }
    },
    [formik, onTokenMetadataChange]
  )

  const currentBalance = useMemo(
    () =>
      currentTokenMetadata
        ? parseFloat(
            formatUnits(currentTokenMetadata.balance, currentTokenMetadata.decimals)
          )
        : 0,

    [currentTokenMetadata]
  )

  return (
    <Box
      data-testid="send-erc20-form"
      as={'fieldset'}
      disabled={formik.isValidating || formik.isSubmitting}
      style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
    >
      <Flex as={Form} direction={'column'}>
        <DropdownSelect
          value={selectedTokenOption}
          onChange={handleTokenOptionChange}
          options={tokenOptions}
          inputLabel="Select Token"
          disabled={isLoadingTreasury}
        />

        {selectedTokenOption === 'custom' && (
          <Box mt={'x5'}>
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
                      isAddress(formik.values.tokenAddress) &&
                      currentTokenMetadata &&
                      !currentTokenMetadata.isValid
                    ? 'Invalid ERC20 token or contract not found'
                    : undefined
              }
            />

            {(isValidatingToken || isLoadingTokenMetadata) && (
              <Text mt={'x2'} color={'text3'} fontSize={14}>
                Validating token...
              </Text>
            )}
          </Box>
        )}

        {/* Token validation loading state */}
        {(isValidatingToken || isLoadingTokenMetadata) && currentTokenAddress && (
          <Box
            mt={'x5'}
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
        {currentTokenMetadata && currentTokenMetadata.isValid && (
          <Box
            as="a"
            href={`${ETHERSCAN_BASE_URL[chain.id]}/token/${currentTokenAddress}?a=${treasury}`}
            target="_blank"
            rel="noopener noreferrer"
            mt={'x5'}
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
            className="hover:bg-background3 hover:border-accent"
          >
            <Flex direction={'column'} gap={'x1'}>
              <Text fontSize={14} fontWeight={'label'}>
                {currentTokenMetadata.name} ({currentTokenMetadata.symbol})
              </Text>
              <Text fontSize={14} color={'text3'}>
                Treasury Balance:{' '}
                {formatCryptoVal(
                  formatUnits(currentTokenMetadata.balance, currentTokenMetadata.decimals)
                )}{' '}
                {currentTokenMetadata.symbol}
              </Text>
              <Text fontSize={12} color={'text4'}>
                Decimals: {currentTokenMetadata.decimals}
              </Text>
            </Flex>
          </Box>
        )}

        {/* Invalid token error state */}
        {currentTokenMetadata && !currentTokenMetadata.isValid && currentTokenAddress && (
          <Box
            mt={'x5'}
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

        <Box mt={'x5'}>
          <SmartInput
            type={TEXT}
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
        </Box>

        <Box mt={'x5'}>
          <SmartInput
            {...formik.getFieldProps(`amount`)}
            inputLabel={
              <Flex justify={'space-between'} width={'100%'}>
                <Box fontWeight={'label'}>Amount</Box>
                {currentTokenMetadata && (
                  <Box color={'text3'} fontWeight="paragraph">
                    Max:{' '}
                    {formatCryptoVal(
                      formatUnits(
                        currentTokenMetadata.balance,
                        currentTokenMetadata.decimals
                      )
                    )}{' '}
                    {currentTokenMetadata.symbol}
                  </Box>
                )}
              </Flex>
            }
            id={`amount`}
            type={NUMBER}
            placeholder={'100'}
            min={0}
            max={currentBalance}
            errorMessage={
              formik.touched.amount && formik.errors.amount
                ? formik.errors.amount
                : undefined
            }
          />
        </Box>

        <Button
          mt={'x9'}
          variant={'outline'}
          borderRadius={'curved'}
          type="submit"
          disabled={
            !formik.isValid || !currentTokenMetadata?.isValid || formik.isSubmitting
          }
        >
          {formik.isSubmitting
            ? 'Adding Transaction to Queue...'
            : 'Add Transaction to Queue'}
        </Button>
      </Flex>
    </Box>
  )
}

export const SendErc20 = () => {
  const chain = useChainStore((x) => x.chain)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const [currentTokenMetadata, setCurrentTokenMetadata] = useState<TokenMetadata | null>(
    null
  )

  const initialValues: SendErc20Values = {
    tokenAddress: '',
    recipientAddress: '',
    amount: 0,
  }

  const handleSubmit = useCallback(
    async (values: SendErc20Values, actions: FormikHelpers<SendErc20Values>) => {
      if (
        !values.amount ||
        !values.recipientAddress ||
        !values.tokenAddress ||
        !currentTokenMetadata?.isValid
      )
        return

      const chainToQuery =
        chain.id === CHAIN_ID.FOUNDRY ? CHAIN_ID.FOUNDRY : CHAIN_ID.ETHEREUM

      const recipient = await getEnsAddress(
        values.recipientAddress,
        getProvider(chainToQuery)
      )
      const tokenAddress = getAddress(values.tokenAddress)
      const amount = parseUnits(values.amount.toString(), currentTokenMetadata.decimals)

      // Encode ERC20 transfer function call
      const calldata = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [getAddress(recipient), amount],
      })

      addTransaction({
        type: TransactionType.SEND_ERC20,
        summary: `Send ${values.amount} ${currentTokenMetadata.symbol} to ${walletSnippet(recipient)}`,
        transactions: [
          {
            functionSignature: 'transfer(address,uint256)',
            target: tokenAddress,
            value: '0',
            calldata,
          },
        ],
      })

      actions.resetForm()
    },
    [chain.id, currentTokenMetadata, addTransaction]
  )

  const currentBalance = useMemo(
    () =>
      currentTokenMetadata
        ? parseFloat(
            formatUnits(currentTokenMetadata.balance, currentTokenMetadata.decimals)
          )
        : 0,
    [currentTokenMetadata]
  )

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        validationSchema={sendErc20Schema(currentBalance)}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => (
          <SendErc20Form
            formik={formik}
            onTokenMetadataChange={setCurrentTokenMetadata}
          />
        )}
      </Formik>
    </Box>
  )
}
