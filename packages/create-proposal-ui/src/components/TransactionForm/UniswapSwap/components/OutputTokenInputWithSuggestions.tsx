import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { usePopularTokens, useTokenMetadataSingle } from '@buildeross/hooks'
import { useChainStore } from '@buildeross/stores'
import { LinkWrapper } from '@buildeross/ui'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import type { FormikProps } from 'formik'
import { useEffect, useState } from 'react'
import { type Address, isAddress } from 'viem'

import type { UniswapSwapFormValues } from '../UniswapSwap.schema'

interface OutputTokenInputWithSuggestionsProps {
  formik: FormikProps<UniswapSwapFormValues>
}

export const OutputTokenInputWithSuggestions: React.FC<
  OutputTokenInputWithSuggestionsProps
> = ({ formik }) => {
  const { id: chainId } = useChainStore((s) => s.chain)
  const { values, setFieldValue, errors, touched } = formik

  const [resolvedAddress, setResolvedAddress] = useState<Address | undefined>()
  const [isResolving, setIsResolving] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Fetch popular tokens
  const { tokens: popularTokens, isLoading: isLoadingTokens } = usePopularTokens(chainId)

  // Fetch token metadata for the output token
  const { tokenMetadata, isLoading: isLoadingMetadata } = useTokenMetadataSingle(
    chainId,
    resolvedAddress
  )

  // Resolve ENS name to address
  useEffect(() => {
    const resolveAddress = async () => {
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
  }, [values.outputTokenAddress, setFieldValue])

  // Update form when metadata loads
  useEffect(() => {
    if (tokenMetadata && resolvedAddress) {
      setFieldValue('outputTokenMetadata', {
        address: resolvedAddress,
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        decimals: tokenMetadata.decimals,
        balance: 0n,
        isValid: true,
      })
    }
  }, [tokenMetadata, resolvedAddress, setFieldValue])

  const handleTokenSelect = (token: (typeof popularTokens)[0]) => {
    setFieldValue('outputTokenAddress', token.address)
    setShowSuggestions(false)
  }

  const isValid = !!values.outputTokenMetadata?.isValid
  const showMetadata = isValid && !isLoadingMetadata && !isResolving

  return (
    <Stack gap="x3">
      <SmartInput
        type={FIELD_TYPES.TEXT}
        formik={formik}
        {...formik.getFieldProps('outputTokenAddress')}
        id="outputTokenAddress"
        inputLabel={
          values.swapDirection === 'buy'
            ? 'Token to Buy (Address)'
            : 'Receive Token (Address)'
        }
        placeholder="0x... or ENS name, or select below"
        isAddress={true}
        errorMessage={
          touched.outputTokenAddress ? (errors.outputTokenAddress as string) : undefined
        }
        onFocus={() => setShowSuggestions(true)}
      />

      {/* Popular Token Suggestions */}
      {showSuggestions &&
        !values.outputTokenAddress &&
        !isLoadingTokens &&
        popularTokens.length > 0 && (
          <Box>
            <Text fontSize="14" fontWeight="display" mb="x2">
              Popular Tokens
            </Text>
            <Flex gap="x2" style={{ flexWrap: 'wrap' }}>
              {popularTokens.map((token) => (
                <Button
                  key={token.address}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTokenSelect(token)}
                >
                  <Flex align="center" gap="x2">
                    <Text>{token.symbol}</Text>
                    {token.isNative && (
                      <Box
                        px="x1"
                        backgroundColor="primary"
                        borderRadius="small"
                        style={{ opacity: 0.8 }}
                      >
                        <Text color="onAccent" fontSize="12">
                          Native
                        </Text>
                      </Box>
                    )}
                  </Flex>
                </Button>
              ))}
            </Flex>
          </Box>
        )}

      {isResolving && (
        <Box p="x3" backgroundColor="background2" borderRadius="curved">
          <Text fontSize="14" color="text3">
            Resolving address...
          </Text>
        </Box>
      )}

      {isLoadingMetadata && resolvedAddress && (
        <Box p="x3" backgroundColor="background2" borderRadius="curved">
          <Text fontSize="14" color="text3">
            Loading token metadata...
          </Text>
        </Box>
      )}

      {showMetadata && (
        <Box
          p="x3"
          backgroundColor="positive"
          borderRadius="curved"
          borderWidth="thin"
          borderStyle="solid"
          borderColor="positive"
        >
          <Flex gap="x3" align="flex-start">
            <Box mt="x1">
              <Icon id="check" color="onPositive" size="sm" />
            </Box>
            <Stack gap="x1">
              <Text color="onPositive" fontWeight="display" fontSize="14">
                {values.outputTokenMetadata?.name} ({values.outputTokenMetadata?.symbol})
              </Text>
              <Text color="onPositive" fontSize="12" fontFamily="mono">
                {resolvedAddress}
              </Text>
              <LinkWrapper
                link={{
                  href: `${ETHERSCAN_BASE_URL[chainId as keyof typeof ETHERSCAN_BASE_URL]}/token/${resolvedAddress}`,
                }}
                isExternal
              >
                <Text
                  color="onPositive"
                  fontSize="12"
                  style={{ textDecoration: 'underline' }}
                >
                  View on Explorer →
                </Text>
              </LinkWrapper>
            </Stack>
          </Flex>
        </Box>
      )}

      {!isValid && !isResolving && !isLoadingMetadata && values.outputTokenAddress && (
        <Box
          p="x3"
          backgroundColor="negative"
          borderRadius="curved"
          borderWidth="thin"
          borderStyle="solid"
          borderColor="negative"
        >
          <Flex gap="x2" align="center">
            <Icon id="warning" color="onNegative" size="sm" />
            <Text color="onNegative" fontSize="14">
              Unable to resolve token address. Please check and try again.
            </Text>
          </Flex>
        </Box>
      )}
    </Stack>
  )
}
