import { Box, Button, Flex, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import React, { ReactNode, useMemo } from 'react'

import { AuctionHistory, StartTimes } from './AuctionChart'
import {
  buttonTab,
  chartSkeleton,
  displayPanelBox,
  innerBox,
  outerBox,
  viewBox,
} from './AuctionChart.css'

export const AuctionGraphLayout = ({
  chart,
  startTime,
  setStartTime,
  chartData,
}: {
  chart?: ReactNode
  viewSwitcher?: ReactNode
  startTime: StartTimes
  setStartTime: (startTime: StartTimes) => void
  chartData?: AuctionHistory[]
}) => {
  const startTimeText = useMemo(() => {
    if (!chartData || !chartData.length) return '--'

    dayjs.extend(relativeTime)
    const date = dayjs.unix(chartData[0].endTime).fromNow()
    return date
  }, [chartData])

  return (
    <Flex
      direction="column"
      alignSelf="center"
      justify={'center'}
      borderRadius={'phat'}
      borderStyle={'solid'}
      borderWidth={'normal'}
      borderColor={'border'}
      w={'100%'}
      className={outerBox}
    >
      <Box
        pos="relative"
        className={viewBox}
        py={{ '@initial': 'x2', '@768': 'x6' }}
        px={{ '@initial': 'x2', '@768': 'x6' }}
      >
        <Flex w={'100%'} justify={'space-between'} align="center" mb={'x4'}>
          <Text variant="paragraph-sm">Auction History</Text>
          <Flex>
            {Object.entries(StartTimes).map(([label, value]) => {
              const isActive = startTime === value

              return (
                <Button
                  key={label}
                  variant="ghost"
                  px={'x0'}
                  py={'x2'}
                  height={'x1'}
                  ml={{ '@initial': 'x4', '@768': 'x6' }}
                  className={
                    isActive ? buttonTab['innerSelected'] : buttonTab['innerUnselected']
                  }
                  onClick={() => setStartTime(value)}
                  size="md"
                >
                  {label}
                </Button>
              )
            })}
          </Flex>
        </Flex>
        <Box className={innerBox}>{chart}</Box>
        <Flex w={'100%'} justify={'space-between'}>
          <Text variant="paragraph-sm">{startTimeText}</Text>
          <Text variant="paragraph-sm">Now</Text>
        </Flex>
      </Box>
    </Flex>
  )
}

export const DisplayPanel = ({
  title,
  description,
}: {
  title: string
  description: string
}) => (
  <Flex
    direction="column"
    alignSelf="center"
    justify={'center'}
    align="center"
    p={'x4'}
    w={'100%'}
    className={displayPanelBox}
  >
    <Text variant="label-md" mb={'x3'} color={'text2'}>
      {title}
    </Text>
    <Text color={'text2'}>{description}</Text>
  </Flex>
)

export const SkeletonPanel = () => (
  <Box
    w={'100%'}
    borderRadius="phat"
    className={chartSkeleton}
    backgroundColor="background2"
  />
)
