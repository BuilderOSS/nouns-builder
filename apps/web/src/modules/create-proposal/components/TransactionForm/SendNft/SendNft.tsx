import { Box, Button, Flex, Text } from '@zoralabs/zord'
import { Form, Formik } from 'formik'
import type { FormikHelpers, FormikProps } from 'formik'
import { useEffect, useState } from 'react'
import { encodeFunctionData, getAddress, isAddress } from 'viem'
import { useReadContracts } from 'wagmi'

import { FallbackImage } from 'src/components/FallbackImage'
import SmartInput from 'src/components/Fields/SmartInput'
import { NUMBER, TEXT } from 'src/components/Fields/types'
import { erc721Abi } from 'src/data/contract/abis/ERC721'
import { erc1155Abi } from 'src/data/contract/abis/ERC1155'
import { useNFTBalance } from 'src/hooks/useNFTBalance'
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
import { getProvider } from 'src/utils/provider'

import sendNftSchema, { SendNftValues } from './SendNft.schema'

type NftOption = 'treasury-nfts' | 'custom' | string

interface NftMetadata {
  name: string
  symbol: string
  isERC721: boolean
  isERC1155: boolean
  balance: bigint
  isValid: boolean
  contractAddress: string
  tokenId: string
}

interface SendNftFormProps {
  formik: FormikProps<SendNftValues>
  onNftMetadataChange: (metadata: NftMetadata | null) => void
}

const SendNftForm = ({ formik, onNftMetadataChange }: SendNftFormProps) => {
  const { treasury } = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const [selectedNftOption, setSelectedNftOption] = useState<NftOption>('')
  const [nftMetadata, setNftMetadata] = useState<NftMetadata | null>(null)

  // Get treasury NFT balances
  const { nfts: treasuryNfts, isLoading: isLoadingTreasury } = useNFTBalance(
    chain.id,
    treasury
  )

  // Get the current contract address and token ID from formik values
  const currentContractAddress =
    selectedNftOption === 'custom'
      ? formik.values.contractAddress || ''
      : selectedNftOption !== '' && selectedNftOption !== 'custom'
        ? selectedNftOption.split(':')[0] || ''
        : ''

  const currentTokenId =
    selectedNftOption === 'custom'
      ? formik.values.tokenId || ''
      : selectedNftOption !== '' && selectedNftOption !== 'custom'
        ? selectedNftOption.split(':')[1] || ''
        : ''

  // NFT validation using useReadContracts - check both ERC721 and ERC1155
  const { data: nftData, isLoading: isValidatingNft } = useReadContracts({
    contracts: [
      // ERC721 checks
      {
        address: currentContractAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'name',
        chainId: chain.id,
      },
      {
        address: currentContractAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'symbol',
        chainId: chain.id,
      },
      {
        address: currentContractAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'ownerOf',
        args: [BigInt(currentTokenId || '0')],
        chainId: chain.id,
      },
      {
        address: currentContractAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'supportsInterface',
        args: ['0x80ac58cd'], // ERC721 interface ID
        chainId: chain.id,
      },
      // ERC1155 checks
      {
        address: currentContractAddress as `0x${string}`,
        abi: erc1155Abi,
        functionName: 'balanceOf',
        args: [treasury as `0x${string}`, BigInt(currentTokenId || '0')],
        chainId: chain.id,
      },
      {
        address: currentContractAddress as `0x${string}`,
        abi: erc1155Abi,
        functionName: 'supportsInterface',
        args: ['0xd9b67a26'], // ERC1155 interface ID
        chainId: chain.id,
      },
    ],
    allowFailure: true, // Allow individual calls to fail
    query: {
      enabled: isAddress(currentContractAddress) && !!treasury && !!currentTokenId,
    },
  })

  // Update NFT metadata when data changes
  useEffect(() => {
    if (nftData && currentContractAddress && currentTokenId) {
      const [
        nameResult,
        symbolResult,
        ownerOfResult,
        erc721InterfaceResult,
        erc1155BalanceResult,
        erc1155InterfaceResult,
      ] = nftData

      const isERC721 =
        erc721InterfaceResult.status === 'success' && erc721InterfaceResult.result
      const isERC1155 =
        erc1155InterfaceResult.status === 'success' && erc1155InterfaceResult.result

      // Determine validity based on contract type
      let isValid = false
      let balance = 0n

      if (isERC721) {
        // For ERC721, check if treasury owns the token
        isValid =
          ownerOfResult.status === 'success' &&
          ownerOfResult.result?.toLowerCase() === treasury?.toLowerCase()
        balance = isValid ? 1n : 0n
      } else if (isERC1155) {
        // For ERC1155, check balance
        isValid =
          erc1155BalanceResult.status === 'success' && erc1155BalanceResult.result > 0n
        balance =
          erc1155BalanceResult.status === 'success' ? erc1155BalanceResult.result : 0n
      }

      if (isValid) {
        const metadata = {
          name: nameResult.status === 'success' ? nameResult.result : 'Unknown',
          symbol: symbolResult.status === 'success' ? symbolResult.result : 'Unknown',
          isERC721,
          isERC1155,
          balance,
          isValid: true,
          contractAddress: currentContractAddress,
          tokenId: currentTokenId,
        }

        setNftMetadata(metadata)
        onNftMetadataChange(metadata)
      } else {
        const metadata = {
          name: '',
          symbol: '',
          isERC721: false,
          isERC1155: false,
          balance: 0n,
          isValid: false,
          contractAddress: currentContractAddress,
          tokenId: currentTokenId,
        }

        setNftMetadata(metadata)
        onNftMetadataChange(metadata)
      }
    } else if (currentContractAddress && currentTokenId && !isValidatingNft) {
      // If we have addresses but no data and not loading, it's invalid
      const metadata = {
        name: '',
        symbol: '',
        isERC721: false,
        isERC1155: false,
        balance: 0n,
        isValid: false,
        contractAddress: currentContractAddress,
        tokenId: currentTokenId,
      }

      setNftMetadata(metadata)
      onNftMetadataChange(metadata)
    }
  }, [
    nftData,
    currentContractAddress,
    currentTokenId,
    isValidatingNft,
    onNftMetadataChange,
    treasury,
    chain.id,
  ])

  // Create dropdown options
  const nftOptions: SelectOption<NftOption>[] = [
    {
      value: '' as NftOption,
      label: 'Select an NFT...',
    },
    ...(treasuryNfts?.map((nft) => {
      const optionValue = `${nft.contract.address}:${nft.tokenId}` as NftOption
      return {
        value: optionValue,
        label: `${nft.name || 'Unnamed'} #${nft.tokenId}`,
        icon: nft.image.originalUrl ? (
          <FallbackImage
            srcList={[nft.image.originalUrl]}
            style={{ width: 20, height: 20, borderRadius: '4px' }}
          />
        ) : undefined,
      }
    }) || []),
    {
      value: 'custom' as NftOption,
      label: 'Custom NFT Contract',
    },
  ]

  // Handle dropdown selection change
  const handleNftOptionChange = (option: NftOption) => {
    setSelectedNftOption(option)
    // Clear existing metadata when changing selection
    setNftMetadata(null)
    onNftMetadataChange(null)

    if (option === 'custom') {
      // Clear the contract address and token ID when switching to custom
      formik.setFieldValue('contractAddress', '')
      formik.setFieldValue('tokenId', '')
    } else if (option !== '' && option !== 'custom') {
      // Set the contract address and token ID from selection
      const [contractAddress, tokenId] = option.split(':')
      formik.setFieldValue('contractAddress', contractAddress || '')
      formik.setFieldValue('tokenId', tokenId || '')
    } else {
      // Clear for placeholder selection
      formik.setFieldValue('contractAddress', '')
      formik.setFieldValue('tokenId', '')
    }
  }

  const maxAmount = nftMetadata?.isERC1155 ? Number(nftMetadata.balance) : 1

  return (
    <Box
      data-testid="send-nft-form"
      as={'fieldset'}
      disabled={formik.isValidating}
      style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
    >
      <Flex as={Form} direction={'column'}>
        <DropdownSelect
          value={selectedNftOption}
          onChange={handleNftOptionChange}
          options={nftOptions}
          inputLabel="Select NFT"
          disabled={isLoadingTreasury}
        />

        {selectedNftOption === 'custom' && (
          <>
            <Box mt={'x5'}>
              <SmartInput
                type={TEXT}
                formik={formik}
                {...formik.getFieldProps('contractAddress')}
                id="contractAddress"
                inputLabel="NFT Contract Address"
                placeholder="0x..."
                isAddress={true}
                errorMessage={
                  formik.touched.contractAddress && formik.errors.contractAddress
                    ? formik.errors.contractAddress
                    : undefined
                }
              />
            </Box>

            <Box mt={'x5'}>
              <SmartInput
                type={TEXT}
                formik={formik}
                {...formik.getFieldProps('tokenId')}
                id="tokenId"
                inputLabel="Token ID"
                placeholder="1"
                errorMessage={
                  formik.touched.tokenId && formik.errors.tokenId
                    ? formik.errors.tokenId
                    : formik.values.contractAddress &&
                        formik.values.tokenId &&
                        isAddress(formik.values.contractAddress) &&
                        nftMetadata &&
                        !nftMetadata.isValid
                      ? 'Invalid NFT or token not owned by treasury'
                      : undefined
                }
              />

              {isValidatingNft && (
                <Text mt={'x2'} color={'text3'} fontSize={14}>
                  Validating NFT...
                </Text>
              )}
            </Box>
          </>
        )}

        {/* NFT validation loading state */}
        {isValidatingNft && currentContractAddress && currentTokenId && (
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
                Validating NFT...
              </Text>
              <Text fontSize={14} color={'text3'}>
                Checking NFT metadata and treasury ownership
              </Text>
            </Flex>
          </Box>
        )}

        {/* Valid NFT metadata display */}
        {nftMetadata && nftMetadata.isValid && (
          <Box
            mt={'x5'}
            p={'x4'}
            backgroundColor={'background2'}
            borderRadius={'curved'}
            borderWidth={'normal'}
            borderStyle={'solid'}
            borderColor={'border'}
          >
            <Flex direction={'column'} gap={'x1'}>
              <Text fontSize={14} fontWeight={'label'}>
                {nftMetadata.name} ({nftMetadata.symbol})
              </Text>
              <Text fontSize={14} color={'text3'}>
                Token ID: {nftMetadata.tokenId}
              </Text>
              <Text fontSize={14} color={'text3'}>
                Type: {nftMetadata.isERC721 ? 'ERC721' : 'ERC1155'}
              </Text>
              {nftMetadata.isERC1155 && (
                <Text fontSize={14} color={'text3'}>
                  Treasury Balance: {nftMetadata.balance.toString()}
                </Text>
              )}
            </Flex>
          </Box>
        )}

        {/* Invalid NFT error state */}
        {nftMetadata &&
          !nftMetadata.isValid &&
          currentContractAddress &&
          currentTokenId && (
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
                  Invalid NFT
                </Text>
                <Text fontSize={14} color={'text3'}>
                  This NFT is not owned by the treasury or the contract/token ID is
                  invalid.
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

        {/* Amount field - only show for ERC1155 */}
        {nftMetadata?.isERC1155 && (
          <Box mt={'x5'}>
            <SmartInput
              {...formik.getFieldProps('amount')}
              inputLabel={
                <Flex justify={'space-between'} width={'100%'}>
                  <Box fontWeight={'label'}>Amount</Box>
                  <Box color={'text3'} fontWeight="paragraph">
                    Max: {nftMetadata.balance.toString()}
                  </Box>
                </Flex>
              }
              id="amount"
              type={NUMBER}
              placeholder={'1'}
              min={1}
              max={maxAmount}
              errorMessage={
                formik.touched.amount && formik.errors.amount
                  ? formik.errors.amount
                  : undefined
              }
            />
          </Box>
        )}

        <Button
          mt={'x9'}
          variant={'outline'}
          borderRadius={'curved'}
          type="submit"
          disabled={!formik.isValid || !nftMetadata?.isValid}
        >
          Add Transaction to Queue
        </Button>
      </Flex>
    </Box>
  )
}

export const SendNft = () => {
  const chain = useChainStore((x) => x.chain)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const [currentNftMetadata, setCurrentNftMetadata] = useState<NftMetadata | null>(null)

  const initialValues: SendNftValues = {
    contractAddress: '',
    tokenId: '',
    recipientAddress: '',
    amount: 1,
  }

  const handleSubmit = async (
    values: SendNftValues,
    actions: FormikHelpers<SendNftValues>
  ) => {
    if (
      !values.recipientAddress ||
      !values.contractAddress ||
      !values.tokenId ||
      !currentNftMetadata?.isValid
    )
      return

    const chainToQuery =
      chain.id === CHAIN_ID.FOUNDRY ? CHAIN_ID.FOUNDRY : CHAIN_ID.ETHEREUM

    const recipient = await getEnsAddress(
      values.recipientAddress,
      getProvider(chainToQuery)
    )
    const contractAddress = getAddress(values.contractAddress)
    const tokenId = BigInt(values.tokenId)

    let calldata: string
    let functionSignature: string

    if (currentNftMetadata.isERC721) {
      // Use safeTransferFrom for ERC721
      calldata = encodeFunctionData({
        abi: erc721Abi,
        functionName: 'safeTransferFrom',
        args: [
          getAddress(currentNftMetadata.contractAddress),
          getAddress(recipient),
          tokenId,
        ],
      })
      functionSignature = 'safeTransferFrom(address,address,uint256)'
    } else {
      // Use safeTransferFrom for ERC1155
      calldata = encodeFunctionData({
        abi: erc1155Abi,
        functionName: 'safeTransferFrom',
        args: [
          getAddress(currentNftMetadata.contractAddress),
          getAddress(recipient),
          tokenId,
          BigInt(values.amount),
          '0x', // empty data
        ],
      })
      functionSignature = 'safeTransferFrom(address,address,uint256,uint256,bytes)'
    }

    const nftType = currentNftMetadata.isERC721 ? 'ERC721' : 'ERC1155'
    const amountText = currentNftMetadata.isERC1155 ? `${values.amount}x ` : ''

    addTransaction({
      type: TransactionType.SEND_NFT,
      summary: `Send ${amountText}${currentNftMetadata.name} #${values.tokenId} (${nftType}) to ${walletSnippet(recipient)}`,
      transactions: [
        {
          functionSignature,
          target: contractAddress,
          value: '0',
          calldata,
        },
      ],
    })

    actions.resetForm()
  }

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        validationSchema={sendNftSchema}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => (
          <SendNftForm formik={formik} onNftMetadataChange={setCurrentNftMetadata} />
        )}
      </Formik>
    </Box>
  )
}
