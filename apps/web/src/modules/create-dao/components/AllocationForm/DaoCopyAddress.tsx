import { AddressType } from '@buildeross/types'
import { CopyButton } from '@buildeross/ui/CopyButton'
import { Box, Flex, Text } from '@buildeross/zord'
import React from 'react'

export const DaoCopyAddress = ({
  image,
  name,
  ens,
  address,
}: {
  image: string
  name?: string
  ens: string
  address: AddressType
}) => {
  return (
    <Flex gap={'x3'} style={{ width: '50%' }} align={'center'}>
      <Box width={'x13'} height={'x13'}>
        <img
          src={image}
          alt={`${name} icon`}
          height={52}
          width={52}
          style={{ borderRadius: '50%' }}
        />
      </Box>

      <Flex direction={'column'}>
        {name && <Text fontWeight={'display'}>{name}</Text>}
        <Flex direction={'row'} align={'center'}>
          <Text>{ens}</Text>
          <CopyButton text={address} />
        </Flex>
      </Flex>
    </Flex>
  )
}
