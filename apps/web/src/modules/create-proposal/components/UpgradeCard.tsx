import { RENDERER_BASE } from '@buildeross/constants/rendererBase'
import { atoms, Box, Button, Flex, Label, Paragraph, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import Image from 'next/image'
import React, { ReactElement } from 'react'

import { btn, card, content, image } from './UpgradeCard.css'

interface UpgradeCardProps {
  hasThreshold: boolean
  onUpgrade: () => void
  totalContractUpgrades?: number
  version?: string
  date?: string
  description?: string
  alert?: ReactElement
}

export const UpgradeCard = ({
  version,
  hasThreshold,
  totalContractUpgrades,
  date,
  description,
  onUpgrade,
  alert,
}: UpgradeCardProps) => {
  const imgurl = `${RENDERER_BASE}?contractAddress=0x963ac521c595d3d1be72c1eb057f24d4d42cb70b&tokenId=90&images=ipfs%3a%2f%2fbafybeieah7wjevdirq3clfpno4mkgn6z7vhdnqqniba62pwyfbwzf7mzqi%2fbackgrounds%2f9-5.svg&images=ipfs%3a%2f%2fbafybeieah7wjevdirq3clfpno4mkgn6z7vhdnqqniba62pwyfbwzf7mzqi%2f0%2f0_14_2_b.svg&images=ipfs%3a%2f%2fbafybeieah7wjevdirq3clfpno4mkgn6z7vhdnqqniba62pwyfbwzf7mzqi%2f1%2f1_a_3.svg&images=ipfs%3a%2f%2fbafybeieah7wjevdirq3clfpno4mkgn6z7vhdnqqniba62pwyfbwzf7mzqi%2f2%2f2_07_1_b.svg&images=ipfs%3a%2f%2fbafybeieah7wjevdirq3clfpno4mkgn6z7vhdnqqniba62pwyfbwzf7mzqi%2f3%2f3_21_10_b.svg&images=ipfs%3a%2f%2fbafybeieah7wjevdirq3clfpno4mkgn6z7vhdnqqniba62pwyfbwzf7mzqi%2f4c%2f4c-13.svg&images=ipfs%3a%2f%2fbafybeieah7wjevdirq3clfpno4mkgn6z7vhdnqqniba62pwyfbwzf7mzqi%2f5%2f5_05_6_w.svg&images=ipfs%3a%2f%2fbafybeieah7wjevdirq3clfpno4mkgn6z7vhdnqqniba62pwyfbwzf7mzqi%2f6%2f6_01-5%20b.svg&images=ipfs%3a%2f%2fbafybeieah7wjevdirq3clfpno4mkgn6z7vhdnqqniba62pwyfbwzf7mzqi%2f7%2f7_13_1_b.svg&images=ipfs%3a%2f%2fbafybeieah7wjevdirq3clfpno4mkgn6z7vhdnqqniba62pwyfbwzf7mzqi%2f8%2f8_14_2_w.svg`

  const imgName = 'Nouns Builder Upgrade'

  return (
    <Flex
      my={'x2'}
      data-testid="upgrade-card"
      direction={'column'}
      borderStyle={'dashed'}
      borderRadius={'curved'}
      borderWidth={'normal'}
      cursor={'pointer'}
      p={{ '@initial': 'x4', '@768': 'x6' }}
      className={card}
    >
      {alert && alert}
      <Flex
        direction={alert ? 'column' : 'row'}
        justify={{ '@initial': 'space-between' }}
        wrap="wrap"
      >
        <Flex
          direction="row"
          justify={{ '@initial': 'space-between' }}
          wrap="wrap"
          mb={alert ? 'x6' : 'x0'}
        >
          <Box
            width={'x16'}
            height={'x16'}
            mr={'x4'}
            backgroundColor="background2"
            borderRadius={'small'}
            className={image}
          >
            <Image
              src={imgurl}
              alt={imgName || ''}
              width={64}
              height={64}
              className={atoms({ borderRadius: 'small' })}
            />
          </Box>
          <Box
            width={{ '@initial': '100%', '@768': 'auto' }}
            mr="auto"
            mt={{ '@initial': 'x2', '@768': 'x0' }}
            className={content}
          >
            <Label size="lg">{`Nouns Builder Upgrade ${version ?? ''}`}</Label>
            {date && totalContractUpgrades && (
              <Paragraph color="tertiary">
                {dayjs(date).format('MMM DD, YYYY')}, {totalContractUpgrades} contract
                upgrades
              </Paragraph>
            )}
          </Box>
        </Flex>

        <Button
          mt={{ '@initial': 'x3', '@768': 'x2' }}
          data-testid="upgrade-btn"
          borderRadius="curved"
          size="sm"
          disabled={!hasThreshold}
          className={btn}
          onClick={onUpgrade}
        >
          Upgrade
        </Button>
      </Flex>

      {description && <Text mt={{ '@initial': 'x2', '@768': 'x4' }}>{description}</Text>}
    </Flex>
  )
}
