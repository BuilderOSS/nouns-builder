import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useNftMetadata } from '@buildeross/hooks/useNftMetadata'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { erc20Abi, erc721Abi, erc1155Abi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { DropdownSelect, SelectOption } from '@buildeross/ui/DropdownSelect'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import type { FormikProps } from 'formik'
import { Form } from 'formik'
import { useEffect, useMemo } from 'react'
import { formatUnits, isAddress } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'

import { PinTreasuryAssetValues } from './PinTreasuryAsset.schema'

interface PinTreasuryAssetFormProps {
  formik: FormikProps<PinTreasuryAssetValues>
}

const TOKEN_TYPE_OPTIONS: SelectOption<string>[] = [
  { label: 'ERC20', value: '0' },
  { label: 'ERC721', value: '1' },
  { label: 'ERC1155', value: '2' },
]

export const PinTreasuryAssetForm = ({ formik }: PinTreasuryAssetFormProps) => {
  const { values, setFieldValue, isValid } = formik
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)

  // Auto-set isCollection to true for ERC20
  useEffect(() => {
    if (values.tokenType === 0) {
      setFieldValue('isCollection', true)
      setFieldValue('tokenId', '0')
    }
  }, [values.tokenType, setFieldValue])

  // Auto-set tokenId to 0 when isCollection is true
  useEffect(() => {
    if (values.isCollection) {
      setFieldValue('tokenId', '0')
    }
  }, [values.isCollection, setFieldValue])

  const handleTokenTypeChange = (value: string) => {
    setFieldValue('tokenType', parseInt(value))
  }

  const handleCollectionToggle = () => {
    setFieldValue('isCollection', !values.isCollection)
  }

  // Get current token address
  const currentTokenAddress = values.tokenAddress?.trim() || ''
  const isValidAddress = isAddress(currentTokenAddress)

  // === ERC20 Token Metadata ===
  const { tokenMetadata: erc20Metadata, isLoading: isLoadingErc20Metadata } =
    useTokenMetadataSingle(
      chain.id,
      isValidAddress && values.tokenType === 0
        ? (currentTokenAddress as `0x${string}`)
        : undefined
    )

  const { data: erc20Balance, isLoading: isLoadingErc20Balance } = useReadContract({
    address:
      isValidAddress && values.tokenType === 0
        ? (currentTokenAddress as `0x${string}`)
        : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: addresses.treasury ? [addresses.treasury as `0x${string}`] : undefined,
    chainId: chain.id,
    query: {
      enabled: isValidAddress && values.tokenType === 0 && !!addresses.treasury,
    },
  })

  const isValidatingErc20 = isLoadingErc20Metadata || isLoadingErc20Balance

  // === NFT Metadata (for specific tokenId) ===
  const currentTokenId = values.tokenId?.trim() || ''
  const shouldFetchNftMetadata =
    isValidAddress && values.tokenType !== 0 && !values.isCollection && !!currentTokenId

  const { metadata: nftMetadata, isLoading: isLoadingNftMetadata } = useNftMetadata(
    chain.id,
    shouldFetchNftMetadata ? (currentTokenAddress as `0x${string}`) : undefined,
    shouldFetchNftMetadata ? currentTokenId : undefined
  )

  // Validate NFT ownership/balance
  const { data: nftData, isLoading: isValidatingNft } = useReadContracts({
    contracts: [
      {
        address: currentTokenAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'ownerOf',
        args: [BigInt(currentTokenId || '0')],
        chainId: chain.id,
      },
      {
        address: currentTokenAddress as `0x${string}`,
        abi: erc1155Abi,
        functionName: 'balanceOf',
        args: [addresses.treasury as `0x${string}`, BigInt(currentTokenId || '0')],
        chainId: chain.id,
      },
    ],
    allowFailure: true,
    query: {
      enabled: shouldFetchNftMetadata && !!addresses.treasury,
    },
  })

  // Compute NFT validation
  const nftValidation = useMemo(() => {
    if (!shouldFetchNftMetadata || !nftData || !nftMetadata) {
      return null
    }

    const [ownerOfResult, balanceOfResult] = nftData
    const isERC721 = nftMetadata.tokenType === 'ERC721'
    const isERC1155 = nftMetadata.tokenType === 'ERC1155'

    let isValid = false
    let balance = 0n

    if (isERC721) {
      isValid =
        ownerOfResult.status === 'success' &&
        ownerOfResult.result?.toLowerCase() === addresses.treasury?.toLowerCase()
      balance = isValid ? 1n : 0n
    } else if (isERC1155) {
      isValid =
        balanceOfResult.status === 'success' && (balanceOfResult.result as bigint) > 0n
      balance =
        balanceOfResult.status === 'success' ? (balanceOfResult.result as bigint) : 0n
    }

    return {
      isValid,
      balance,
      isERC721,
      isERC1155,
      name: nftMetadata.name || 'Unknown',
      image: nftMetadata.image,
    }
  }, [shouldFetchNftMetadata, nftData, nftMetadata, addresses.treasury])

  return (
    <Box>
      <Form>
        <Stack gap="x4">
          {/* Token Type Selection */}
          <Box>
            <Text mb="x2" fontWeight="label">
              Token Type
            </Text>
            <DropdownSelect
              options={TOKEN_TYPE_OPTIONS}
              value={values.tokenType.toString()}
              onChange={handleTokenTypeChange}
            />
          </Box>

          {/* Token Address */}
          <SmartInput
            {...formik.getFieldProps('tokenAddress')}
            id="tokenAddress"
            inputLabel="Token Address"
            formik={formik}
            type={FIELD_TYPES.TEXT}
            placeholder="0x..."
            helperText="The contract address of the token to pin"
            isAddress
            errorMessage={
              formik.touched.tokenAddress && formik.errors.tokenAddress
                ? formik.errors.tokenAddress
                : undefined
            }
          />

          {/* ERC20 Token Metadata Display */}
          {values.tokenType === 0 && isValidAddress && (
            <>
              {/* Validating state */}
              {isValidatingErc20 && (
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
                      Checking token metadata and treasury balance
                    </Text>
                  </Flex>
                </Box>
              )}

              {/* Valid token display */}
              {!isValidatingErc20 && erc20Metadata && erc20Balance !== undefined && (
                <Box
                  as="a"
                  href={`${ETHERSCAN_BASE_URL[chain.id]}/token/${currentTokenAddress}?a=${addresses.treasury}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  p="x4"
                  backgroundColor="background2"
                  borderRadius="curved"
                  borderWidth="normal"
                  borderStyle="solid"
                  borderColor="border"
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                >
                  <Flex direction="column" gap="x1">
                    <Text fontSize={14} fontWeight="label">
                      {erc20Metadata.name} ({erc20Metadata.symbol})
                    </Text>
                    <Text fontSize={14} color="text3">
                      Treasury Balance:{' '}
                      {formatCryptoVal(formatUnits(erc20Balance, erc20Metadata.decimals))}{' '}
                      {erc20Metadata.symbol}
                    </Text>
                    <Text fontSize={12} color="text4">
                      Decimals: {erc20Metadata.decimals}
                    </Text>
                  </Flex>
                </Box>
              )}

              {/* Invalid token */}
              {!isValidatingErc20 && !erc20Metadata && (
                <Box
                  p="x4"
                  backgroundColor="background2"
                  borderRadius="curved"
                  borderWidth="normal"
                  borderStyle="solid"
                  borderColor="negative"
                >
                  <Flex direction="column" gap="x2">
                    <Text fontWeight="label" fontSize={16} color="negative">
                      Invalid Token
                    </Text>
                    <Text fontSize={14} color="text3">
                      This address is not a valid ERC20 token or the contract could not be
                      found.
                    </Text>
                  </Flex>
                </Box>
              )}
            </>
          )}

          {/* Collection Toggle (only for NFTs) */}
          {values.tokenType !== 0 && (
            <Box>
              <Flex align="center" gap="x2">
                <input
                  type="checkbox"
                  checked={values.isCollection}
                  onChange={handleCollectionToggle}
                  id="isCollection"
                />
                <label htmlFor="isCollection">
                  <Text>Pin entire collection</Text>
                </label>
              </Flex>
              <Text mt="x1" fontSize="14" color="text3">
                {values.isCollection
                  ? 'All tokens from this collection will be pinned'
                  : 'Pin a specific token ID'}
              </Text>
            </Box>
          )}

          {/* Token ID (only for specific NFTs) */}
          {values.tokenType !== 0 && !values.isCollection && (
            <>
              <SmartInput
                {...formik.getFieldProps('tokenId')}
                id="tokenId"
                inputLabel="Token ID"
                formik={formik}
                type={FIELD_TYPES.TEXT}
                placeholder="0"
                helperText="The specific NFT token ID to pin"
                errorMessage={
                  formik.touched.tokenId && formik.errors.tokenId
                    ? formik.errors.tokenId
                    : undefined
                }
              />

              {/* NFT Metadata Display */}
              {shouldFetchNftMetadata && (
                <>
                  {/* Validating NFT */}
                  {(isLoadingNftMetadata || isValidatingNft) && (
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
                          Validating NFT...
                        </Text>
                        <Text fontSize={14} color="text3">
                          Checking NFT metadata and ownership
                        </Text>
                      </Flex>
                    </Box>
                  )}

                  {/* Valid NFT display */}
                  {!isLoadingNftMetadata &&
                    !isValidatingNft &&
                    nftValidation?.isValid && (
                      <Box
                        as="a"
                        href={`${ETHERSCAN_BASE_URL[chain.id]}/token/${currentTokenAddress}?a=${addresses.treasury}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        p="x4"
                        backgroundColor="background2"
                        borderRadius="curved"
                        borderWidth="normal"
                        borderStyle="solid"
                        borderColor="border"
                        style={{
                          textDecoration: 'none',
                          display: 'block',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                      >
                        <Flex direction="row" gap="x4">
                          {/* NFT Image */}
                          {nftValidation.image && (
                            <Box style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                              <Box
                                aspectRatio={1}
                                backgroundColor="border"
                                borderRadius="curved"
                              >
                                <FallbackImage
                                  src={nftValidation.image}
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
                          <Flex direction="column" gap="x1" flex={1}>
                            <Text fontSize={14} fontWeight="label">
                              {nftValidation.name}
                            </Text>
                            <Text fontSize={14} color="text3">
                              Token ID: {currentTokenId}
                            </Text>
                            <Text fontSize={14} color="text3">
                              Type: {nftValidation.isERC721 ? 'ERC721' : 'ERC1155'}
                            </Text>
                            {nftValidation.isERC1155 && (
                              <Text fontSize={14} color="text3">
                                Balance: {nftValidation.balance.toString()}
                              </Text>
                            )}
                          </Flex>
                        </Flex>
                      </Box>
                    )}

                  {/* Invalid NFT */}
                  {!isLoadingNftMetadata &&
                    !isValidatingNft &&
                    nftValidation &&
                    !nftValidation.isValid && (
                      <Box
                        p="x4"
                        backgroundColor="background2"
                        borderRadius="curved"
                        borderWidth="normal"
                        borderStyle="solid"
                        borderColor="negative"
                      >
                        <Flex direction="column" gap="x2">
                          <Text fontWeight="label" fontSize={16} color="negative">
                            NFT Not Found in Treasury
                          </Text>
                          <Text fontSize={14} color="text3">
                            This NFT is not owned by the treasury or the contract could
                            not be found.
                          </Text>
                        </Flex>
                      </Box>
                    )}
                </>
              )}
            </>
          )}

          {/* Canonical Rules Info */}
          <Box p="x4" backgroundColor="background2" borderRadius="curved" mt="x4">
            <Text fontSize="14" color="text3">
              <strong>Rules:</strong>
              <br />
              • Token cannot be the zero address
              <br />• For specific NFTs, provide the exact tokenId
            </Text>
          </Box>

          <Button type="submit" variant="outline" disabled={!isValid} w="100%">
            Add Transaction to Queue
          </Button>
        </Stack>
      </Form>
    </Box>
  )
}
