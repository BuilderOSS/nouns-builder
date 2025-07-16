import { getFetchableUrls } from '@buildeross/ipfs-service'
import { Box, Flex, Text } from '@buildeross/zord'
import { useMemo } from 'react'

import { FallbackImage } from 'src/components/FallbackImage'
import { useNftMetadata } from 'src/hooks/useNftMetadata'
import { useChainStore } from 'src/stores/useChainStore'
import { DecodedArg } from 'src/typings'

import { DecodedValueRenderer } from './DecodedValueRenderer'

interface NFTArgumentDisplayProps {
  arg: DecodedArg
  target: string
  functionName?: string
}

export const NFTArgumentDisplay: React.FC<NFTArgumentDisplayProps> = ({
  arg,
  target,
  functionName,
}) => {
  const chain = useChainStore((x) => x.chain)

  const tokenId = useMemo(() => {
    if (
      arg.name === 'tokenId' ||
      arg.name === 'id' ||
      arg.name === '_tokenId' ||
      arg.name === '_id'
    ) {
      return arg.value as string
    }
    return undefined
  }, [arg])

  const { metadata: nftMetadata } = useNftMetadata(
    chain.id,
    target as `0x${string}`,
    tokenId
  )

  // Memoize image sources to prevent re-renders
  const imageSrcList = useMemo(() => {
    if (!nftMetadata?.image) return []
    const fetchableUrls = getFetchableUrls(nftMetadata.image)
    return fetchableUrls ? [nftMetadata.image, ...fetchableUrls] : [nftMetadata.image]
  }, [nftMetadata?.image])

  // Check if this is an NFT transfer function and we have the necessary data
  const isNftTransfer = functionName === 'safeTransferFrom' && tokenId && nftMetadata

  if (isNftTransfer && nftMetadata.image) {
    const name = arg.name.startsWith('_') ? '_token' : 'token'
    const typeName = arg.name.startsWith('_') ? '_type' : 'type'
    return (
      <>
        <DecodedValueRenderer name={typeName} value={nftMetadata.tokenType} />
        <Box key={arg.name + target}>
          <Flex key={'nft' + target} align="center" w="100%" gap="x2">
            <Text style={{ flexShrink: 0 }}>{name}:</Text>
            <Box style={{ width: '24px', height: '24px', flexShrink: 0 }}>
              <Box aspectRatio={1} backgroundColor="border" borderRadius="curved">
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
            <Text>
              {nftMetadata.name} #{tokenId}
            </Text>
          </Flex>
        </Box>
      </>
    )
  }
  if (
    arg.name === 'value' ||
    arg.name === '_value' ||
    arg.name === 'amount' ||
    arg.name === '_amount'
  ) {
    return <DecodedValueRenderer name="amount" value={arg.value} />
  }

  if ((arg.name === 'data' || arg.name === '_data') && arg.value === '0x') {
    return null
  }

  // Default rendering for other arguments
  return <DecodedValueRenderer name={arg.name} value={arg.value} />
}
