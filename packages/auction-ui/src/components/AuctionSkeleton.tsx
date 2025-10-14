import { Box, Flex, Grid } from '@buildeross/zord'

import {
  auctionGrid,
  auctionSkeleton,
  auctionWrapper,
  auctionWrapVariants,
  tokenImage,
} from './Auction.css'

export const AuctionSkeleton = () => {
  return (
    <Flex className={auctionWrapVariants['post']}>
      <Grid className={auctionGrid}>
        <Box
          backgroundColor="background2"
          width={'100%'}
          height={'auto'}
          aspectRatio={1 / 1}
          position="relative"
          className={[tokenImage, auctionSkeleton]}
        ></Box>
        <Flex
          direction={'column'}
          height={{ '@initial': 'auto', '@768': '100%' }}
          mt={{ '@initial': 'x4', '@768': 'x0' }}
          className={auctionWrapper}
        >
          <Box
            backgroundColor="background2"
            h="x8"
            className={auctionSkeleton}
            style={{ width: '350px' }}
            borderRadius="normal"
          />
          <Box
            backgroundColor="background2"
            className={auctionSkeleton}
            h="x16"
            w="x64"
            mt="x4"
            borderRadius="normal"
          />
          <Flex w="100%">
            <Box
              backgroundColor="background2"
              className={auctionSkeleton}
              h="x16"
              w="x32"
              style={{ width: '150px' }}
              mt="x4"
              borderRadius="normal"
            />
            <Box
              backgroundColor="background2"
              className={auctionSkeleton}
              h="x16"
              ml="x6"
              style={{ width: '150px' }}
              mt="x4"
              borderRadius="normal"
            />
          </Flex>
          <Flex w="100%">
            <Box
              backgroundColor="background2"
              className={auctionSkeleton}
              h="x10"
              w="x64"
              mt="x4"
              borderRadius="normal"
            />
            <Box
              backgroundColor="background2"
              className={auctionSkeleton}
              h="x10"
              ml="x6"
              w="x32"
              mt="x4"
              borderRadius="normal"
            />
          </Flex>
          <Box
            backgroundColor="background2"
            className={auctionSkeleton}
            h="x6"
            style={{ width: '400px' }}
            mt="x4"
            borderRadius="normal"
          />
        </Flex>
      </Grid>
    </Flex>
  )
}
