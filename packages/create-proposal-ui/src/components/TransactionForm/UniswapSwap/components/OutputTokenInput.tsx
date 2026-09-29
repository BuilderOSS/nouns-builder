import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useTokenMetadataSingle } from '@buildeross/hooks'
import { useChainStore } from '@buildeross/stores'
import { LinkWrapper } from '@buildeross/ui'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Box, Flex, Icon, Stack, Text } from '@buildeross/zord'
import type { FormikProps } from 'formik'
import { useEffect, useRef, useState } from 'react'
import { type Address, isAddress } from 'viem'

import type { UniswapSwapFormValues } from '../UniswapSwap.schema'

interface OutputTokenInputProps {
  formik: FormikProps<UniswapSwapFormValues>
}

export const OutputTokenInput: React.FC<OutputTokenInputProps> = ({ formik }) => {
  const { id: chainId } = useChainStore((s) => s.chain)
  const { values, setFieldValue, errors, touched } = formik

  const [resolvedAddress, setResolvedAddress] = useState<Address | undefined>()
  const [isResolving, setIsResolving] = useState(false)

  // Track request identifier to prevent race conditions
  const requestIdRef = useRef(0)

  // Fetch token metadata for the output token
  const { tokenMetadata, isLoading: isLoadingMetadata } = useTokenMetadataSingle(
    chainId,
    resolvedAddress
  )

  // Resolve ENS name to address
  useEffect(() => {
    const resolveAddress = async () => {
      const inputValue = values.outputTokenAddress?.trim()

      // Increment request identifier for this new request
      requestIdRef.current += 1
      const currentRequestId = requestIdRef.current

      // Clear metadata immediately when input changes
      setFieldValue('outputTokenMetadata', undefined)

      if (!inputValue) {
        setResolvedAddress(undefined)
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
        // Only apply result if this is still the latest request
        if (requestIdRef.current === currentRequestId) {
          if (resolved && isAddress(resolved)) {
            setResolvedAddress(resolved as Address)
          } else {
            setResolvedAddress(undefined)
          }
        }
      } catch (error) {
        console.error('Error resolving ENS:', error)
        // Only clear if this is still the latest request
        if (requestIdRef.current === currentRequestId) {
          setResolvedAddress(undefined)
        }
      } finally {
        // Only clear resolving state if this is still the latest request
        if (requestIdRef.current === currentRequestId) {
          setIsResolving(false)
        }
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
        balance: 0n, // Output token balance not relevant for proposals
        isValid: true,
      })
    }
  }, [tokenMetadata, resolvedAddress, setFieldValue])

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
        placeholder="0x... or ENS name"
        isAddress={true}
        errorMessage={
          touched.outputTokenAddress ? (errors.outputTokenAddress as string) : undefined
        }
      />

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
