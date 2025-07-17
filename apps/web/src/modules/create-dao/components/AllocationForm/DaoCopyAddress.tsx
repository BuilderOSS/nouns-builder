import { AddressType } from '@buildeross/types'
import { Box, Flex, Text } from '@buildeross/zord'
import Image from 'next/image'
import React from 'react'

import CopyButton from 'src/components/CopyButton/CopyButton'

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
}) => (
  <Flex gap={'x3'} style={{ width: '50%' }} align={'center'}>
    <Box width={'x13'} height={'x13'}>
      <Image
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
