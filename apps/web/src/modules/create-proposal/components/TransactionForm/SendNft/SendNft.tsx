import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useNFTBalance } from '@buildeross/hooks/useNFTBalance'
import { useNftMetadata } from '@buildeross/hooks/useNftMetadata'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { erc721Abi, erc1155Abi } from '@buildeross/sdk/contract'
import { CHAIN_ID } from '@buildeross/types'
import { getEnsAddress } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { getProvider } from '@buildeross/utils/provider'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import type { FormikHelpers, FormikProps } from 'formik'
import { Form, Formik } from 'formik'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMemo } from 'react'
import { FallbackImage } from 'src/components/FallbackImage'
import SmartInput from 'src/components/Fields/SmartInput'
import { NUMBER, TEXT } from 'src/components/Fields/types'
import { TransactionType, useProposalStore } from 'src/modules/create-proposal'
import {
  DropdownSelect,
  SelectOption,
} from 'src/modules/create-proposal/components/DropdownSelect'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { encodeFunctionData, getAddress, isAddress } from 'viem'
import { useReadContracts } from 'wagmi'

import sendNftSchema, { SendNftValues } from './SendNft.schema'

type NftOption = 'treasury-nfts' | 'custom' | string

interface NftMetadata {
  name: string
  isERC721: boolean
  isERC1155: boolean
  balance: bigint
  isValid: boolean
  contractAddress: string
  tokenId: string
  image?: string
  metadataName?: string
  metadataDescription?: string
}

interface SendNftFormProps {
  formik: FormikProps<SendNftValues>
  onNftMetadataChange: (metadata: NftMetadata | null) => void
}

const SendNftForm = ({ formik, onNftMetadataChange }: SendNftFormProps) => {
  const { treasury } = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const [selectedNftOption, setSelectedNftOption] = useState<NftOption>('')

  // Use ref to avoid dependency issues with onNftMetadataChange
  const onNftMetadataChangeRef = useRef(onNftMetadataChange)
  useEffect(() => {
    onNftMetadataChangeRef.current = onNftMetadataChange
  })

  // Get treasury NFT balances
  const { nfts: treasuryNfts, isLoading: isLoadingTreasury } = useNFTBalance(
    chain.id,
    treasury
  )

  // Get the current contract address and token ID from formik values
  const currentContractAddress = useMemo(() => {
    if (selectedNftOption === 'custom') {
      return formik.values.contractAddress || ''
    }
    if (selectedNftOption !== '' && selectedNftOption !== 'custom') {
      return selectedNftOption.split(':')[0] || ''
    }
    return ''
  }, [selectedNftOption, formik.values.contractAddress])

  const currentTokenId = useMemo(() => {
    if (selectedNftOption === 'custom') {
      return formik.values.tokenId || ''
    }
    if (selectedNftOption !== '' && selectedNftOption !== 'custom') {
      return selectedNftOption.split(':')[1] || ''
    }
    return ''
  }, [selectedNftOption, formik.values.tokenId])

  // Get Alchemy NFT metadata for enhanced image/metadata display
  const { metadata: alchemyMetadata, isLoading: isLoadingAlchemyMetadata } =
    useNftMetadata(chain.id, currentContractAddress as `0x${string}`, currentTokenId)

  // Always query both ownerOf and balanceOf for validation
  const { data: nftData, isLoading: isValidatingNft } = useReadContracts({
    contracts: [
      // ERC721 ownership check
      {
        address: currentContractAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'ownerOf',
        args: [BigInt(currentTokenId || '0')],
        chainId: chain.id,
      },
      // ERC1155 balance check
      {
        address: currentContractAddress as `0x${string}`,
        abi: erc1155Abi,
        functionName: 'balanceOf',
        args: [treasury as `0x${string}`, BigInt(currentTokenId || '0')],
        chainId: chain.id,
      },
    ],
    allowFailure: true, // Allow individual calls to fail
    query: {
      enabled: isAddress(currentContractAddress) && !!treasury && !!currentTokenId,
    },
  })

  // Memoize the computed metadata to prevent continuous re-computation
  const computedMetadata = useMemo((): NftMetadata | null => {
    if (!currentContractAddress || !currentTokenId || !alchemyMetadata || !nftData) {
      return null
    }

    // Use Alchemy data for name and type
    const name = alchemyMetadata.name || 'Unknown'
    const tokenType = alchemyMetadata.tokenType
    const isERC721 = tokenType === 'ERC721'
    const isERC1155 = tokenType === 'ERC1155'

    // Check contract query results
    const [ownerOfResult, balanceOfResult] = nftData

    let isValid = false
    let balance = 0n

    if (isERC721) {
      // For ERC721, check ownership
      isValid =
        ownerOfResult.status === 'success' &&
        ownerOfResult.result?.toLowerCase() === treasury?.toLowerCase()
      balance = isValid ? 1n : 0n
    } else if (isERC1155) {
      // For ERC1155, check balance
      isValid =
        balanceOfResult.status === 'success' && (balanceOfResult.result as bigint) > 0n
      balance =
        balanceOfResult.status === 'success' ? (balanceOfResult.result as bigint) : 0n
    }

    return {
      name,
      isERC721,
      isERC1155,
      balance,
      isValid,
      contractAddress: currentContractAddress,
      tokenId: currentTokenId,
      image: alchemyMetadata.image || undefined,
      metadataName: alchemyMetadata.name || undefined,
      metadataDescription: alchemyMetadata.description || undefined,
    }
  }, [nftData, currentContractAddress, currentTokenId, treasury, alchemyMetadata])

  // Update NFT metadata when computed metadata changes
  useEffect(() => {
    onNftMetadataChangeRef.current(computedMetadata)
  }, [computedMetadata])

  // Create dropdown options
  const nftOptions: SelectOption<NftOption>[] = useMemo(
    () => [
      {
        value: '' as NftOption,
        label: 'Select an NFT...',
      },
      ...(treasuryNfts?.map((nft) => {
        const optionValue = `${nft.contract.address}:${nft.tokenId}` as NftOption
        const fetchableUrls = nft.image.originalUrl
          ? getFetchableUrls(nft.image.originalUrl)
          : []

        return {
          value: optionValue,
          label: `${nft.name || 'Unnamed'} #${nft.tokenId} (${nft.tokenType})`,
          icon: nft.image.originalUrl ? (
            <FallbackImage
              srcList={fetchableUrls}
              style={{ width: 20, height: 20, borderRadius: '4px' }}
            />
          ) : undefined,
        }
      }) || []),
      {
        value: 'custom' as NftOption,
        label: 'Custom NFT Contract',
      },
    ],
    [treasuryNfts]
  )

  // Handle dropdown selection change
  const handleNftOptionChange = useCallback(
    (option: NftOption) => {
      setSelectedNftOption(option)
      // Clear existing metadata when changing selection
      onNftMetadataChangeRef.current(null)

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
    },
    [formik]
  )

  const maxAmount = useMemo(
    () => (computedMetadata?.isERC1155 ? Number(computedMetadata.balance) : 1),
    [computedMetadata]
  )

  // Memoize the image source list to prevent re-renders
  const imageSrcList = useMemo(() => {
    if (!computedMetadata?.image) return []
    const fetchableUrls = getFetchableUrls(computedMetadata.image)
    return fetchableUrls
      ? [computedMetadata.image, ...fetchableUrls]
      : [computedMetadata.image]
  }, [computedMetadata?.image])

  return (
    <Box
      data-testid="send-nft-form"
      as={'fieldset'}
      disabled={formik.isValidating || formik.isSubmitting}
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
                        computedMetadata &&
                        !computedMetadata.isValid
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
        {(isValidatingNft || isLoadingAlchemyMetadata) &&
          currentContractAddress &&
          currentTokenId && (
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
                {isLoadingAlchemyMetadata && (
                  <Text fontSize={12} color={'text4'}>
                    Loading enhanced metadata...
                  </Text>
                )}
              </Flex>
            </Box>
          )}

        {/* Valid NFT metadata display */}
        {computedMetadata && computedMetadata.isValid && (
          <Box
            as="a"
            href={`${ETHERSCAN_BASE_URL[chain.id]}/token/${computedMetadata.contractAddress}?a=${treasury}`}
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
            <Flex direction={'row'} gap={'x4'}>
              {/* NFT Image */}
              {computedMetadata.image && (
                <Box style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                  <Box aspectRatio={1} backgroundColor={'border'} borderRadius={'curved'}>
                    <FallbackImage
                      srcList={imageSrcList}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 'inherit',
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* NFT Details */}
              <Flex direction={'column'} gap={'x1'} flex={1}>
                <Text fontSize={14} fontWeight={'label'}>
                  {computedMetadata.metadataName || computedMetadata.name}
                </Text>
                <Text fontSize={14} color={'text3'}>
                  Token ID: {computedMetadata.tokenId}
                </Text>
                <Text fontSize={14} color={'text3'}>
                  Type: {computedMetadata.isERC721 ? 'ERC721' : 'ERC1155'}
                </Text>
                {computedMetadata.isERC1155 && (
                  <Text fontSize={14} color={'text3'}>
                    Treasury Balance: {computedMetadata.balance.toString()}
                  </Text>
                )}
              </Flex>
            </Flex>
          </Box>
        )}

        {/* Invalid NFT error state */}
        {computedMetadata &&
          !computedMetadata.isValid &&
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
        {computedMetadata?.isERC1155 && (
          <Box mt={'x5'}>
            <SmartInput
              {...formik.getFieldProps('amount')}
              inputLabel={
                <Flex justify={'space-between'} width={'100%'}>
                  <Box fontWeight={'label'}>Amount</Box>
                  <Box color={'text3'} fontWeight="paragraph">
                    Max: {computedMetadata.balance.toString()}
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
          disabled={!formik.isValid || !computedMetadata?.isValid || formik.isSubmitting}
        >
          {formik.isSubmitting
            ? 'Adding Transaction to Queue...'
            : 'Add Transaction to Queue'}
        </Button>
      </Flex>
    </Box>
  )
}

export const SendNft = () => {
  const { treasury } = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const [currentNftMetadata, setCurrentNftMetadata] = useState<NftMetadata | null>(null)

  const initialValues: SendNftValues = {
    contractAddress: '',
    tokenId: '',
    recipientAddress: '',
    amount: 1,
  }

  const handleSubmit = useCallback(
    async (values: SendNftValues, actions: FormikHelpers<SendNftValues>) => {
      if (
        !values.recipientAddress ||
        !values.contractAddress ||
        !values.tokenId ||
        !treasury ||
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
          args: [getAddress(treasury), getAddress(recipient), tokenId],
        })
        functionSignature = 'safeTransferFrom(address,address,uint256)'
      } else {
        // Use safeTransferFrom for ERC1155
        calldata = encodeFunctionData({
          abi: erc1155Abi,
          functionName: 'safeTransferFrom',
          args: [
            getAddress(treasury),
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
    },
    [chain.id, currentNftMetadata, addTransaction, treasury]
  )

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
