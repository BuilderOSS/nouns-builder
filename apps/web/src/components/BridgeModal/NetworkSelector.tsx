import { CHAIN_ID, Chain } from '@buildeross/types'
import { Box, Flex, PopUp, Stack, Text } from '@buildeross/zord'
import Image from 'next/image'
import React from 'react'

import { PUBLIC_DEFAULT_CHAINS } from 'src/constants/chains'

import { Icon } from '../Icon'
import { chainPopUpButton } from './BridgeForm.styles.css'

export interface NetworkSelectorProps {
  selectedChain: Chain
  setSelectedChain: (value: Chain) => void
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedChain,
  setSelectedChain,
}) => {
  const [isOpenChainMenu, setIsOpenChainMenu] = React.useState(false)

  const onChainChange = (chainId: number) => {
    const selected = PUBLIC_DEFAULT_CHAINS.find((x) => x.id === chainId)
    if (selected) setSelectedChain(selected)
  }

  const isSelectedChain = (chainId: CHAIN_ID) => selectedChain.id === chainId

  return (
    <Flex
      onClick={() => {
        setIsOpenChainMenu((bool) => !bool)
      }}
    >
      <PopUp
        padding="x0"
        placement="bottom-end"
        close={!isOpenChainMenu}
        onOpenChange={(open) => {
          setIsOpenChainMenu(open)
        }}
        trigger={
          <Flex
            borderColor="border"
            borderStyle="solid"
            backgroundColor="background1"
            borderRadius="curved"
            cursor={'pointer'}
            align={'center'}
            justify={'space-between'}
            height={'x10'}
            px="x2"
          >
            <Flex align={'center'}>
              <Flex align={'center'} h="x5" w="x5">
                <Image
                  priority={true}
                  quality={100}
                  style={{ height: 20, width: 20 }}
                  src={selectedChain.icon}
                  alt={selectedChain.name}
                />
              </Flex>
              <Text fontWeight={'heading'} ml="x2">
                {selectedChain.name}
              </Text>
              <Box h="x6" w="x6" ml="x1">
                <Icon id="chevronDown" fill="tertiary" pointerEvents="none" />
              </Box>
            </Flex>
          </Flex>
        }
      >
        <Stack my="x4" mx="x2">
          {PUBLIC_DEFAULT_CHAINS.slice(1).map((chain, i, chains) => (
            <Flex
              key={chain.id}
              className={chainPopUpButton}
              borderRadius="normal"
              onClick={() => onChainChange(chain.id)}
              cursor={isSelectedChain(chain.id) ? undefined : 'pointer'}
              height={'x10'}
              px="x4"
              mb={i !== chains.length - 1 ? 'x2' : undefined}
              align={'center'}
              justify={'space-between'}
            >
              <Flex align={'center'}>
                <Box h="x6" w="x6" mr="x2">
                  <Image
                    style={{ height: 24, width: 24 }}
                    src={chain.icon}
                    alt={chain.name}
                  />
                </Box>
                <Text fontWeight={'heading'}>{chain.name}</Text>
              </Flex>
              <Icon
                id="check"
                fill="tertiary"
                ml="x10"
                style={{
                  visibility: selectedChain.id === chain.id ? 'visible' : 'hidden',
                }}
              />
            </Flex>
          ))}
        </Stack>
      </PopUp>
    </Flex>
  )
}
