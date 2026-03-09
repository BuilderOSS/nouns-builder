import { Box, Flex, Text } from '@buildeross/zord'
import React from 'react'

export const AirdropTokensDetailsDisplay = ({
  totalAmountWithSymbol,
  recipientCount,
  ipfsStatus,
}: {
  totalAmountWithSymbol?: string
  recipientCount: number
  ipfsStatus?: string
}) => {
  return (
    <Box
      p={'x4'}
      backgroundColor={'background2'}
      borderWidth={'normal'}
      borderStyle={'solid'}
      borderColor={'border'}
      borderRadius={'curved'}
    >
      <Flex direction={'column'} gap={'x1'}>
        <Text fontWeight={'label'} fontSize={16}>
          Airdrop Overview
        </Text>
        <Text fontSize={14} color={'text3'}>
          Recipients: {recipientCount}
        </Text>
        {totalAmountWithSymbol && (
          <Text fontSize={14} color={'text3'}>
            Total Amount: {totalAmountWithSymbol}
          </Text>
        )}
        {ipfsStatus && (
          <Text fontSize={14} color={'text3'}>
            {ipfsStatus}
          </Text>
        )}
      </Flex>
    </Box>
  )
}
