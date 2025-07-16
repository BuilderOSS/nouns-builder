import { Box, Button, Flex, Heading, Spinner, Stack, Text } from '@buildeross/zord'

import { formatCryptoVal } from 'src/utils/numbers'

export interface WarningModalProps {
  daoName: string
  isAverage: boolean
  currentBid: string
  maxReccomendedBid: string
  isCreatingBid: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const WarningModal: React.FC<WarningModalProps> = ({
  daoName,
  currentBid,
  isAverage,
  maxReccomendedBid,
  isCreatingBid,
  onConfirm,
  onCancel,
}) => {
  return (
    <Stack>
      <Text color="text1" fontSize={18} fontWeight={'display'}>
        <Box as="span" mr="x1">
          &#9888;
        </Box>
        Bid amount is significantly higher than the {isAverage ? 'average' : 'minimum'}{' '}
        auction price for {daoName}
      </Text>

      <Flex justify={'space-between'} mt="x8">
        <Stack>
          <Text>Your bid</Text>
          <Heading color="text2">{formatCryptoVal(currentBid)} ETH</Heading>
        </Stack>
        <Stack>
          <Text>{isAverage ? 'Average' : 'Minimum'} price</Text>
          <Heading color="text2">{formatCryptoVal(maxReccomendedBid)} ETH</Heading>
        </Stack>
      </Flex>

      <Flex mt="x8">
        <Box style={{ width: '50%' }} pr="x2">
          <Button disabled={isCreatingBid} w="100%" onClick={onConfirm}>
            {isCreatingBid ? (
              <Flex align={'center'}>
                <Spinner mr="x2" size="lg" /> Placing bid
              </Flex>
            ) : (
              'Place bid'
            )}
          </Button>
        </Box>

        <Box style={{ width: '50%' }} pl="x2">
          <Button w="100%" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </Flex>
    </Stack>
  )
}
