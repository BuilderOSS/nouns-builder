import { Accordion } from '@buildeross/ui/Accordion'
import { defaultFileDownloadStyle } from '@buildeross/ui/styles'
import { Box, Flex, Icon, Stack, Text } from '@buildeross/zord'

import { homeSectionHeader, homeSectionWrapper } from './Home.css'

export const FAQ = () => {
  const items = [
    {
      title: 'What is Nouns Builder?',
      description: (
        <>
          <Flex mb={'x4'}>
            Nouns Builder is a tool that allows any DAO to form and govern completely
            onchain, in the format of Nouns DAO.
          </Flex>
          <Flex mb={'x4'}>
            Nouns are an experimental attempt to improve the formation of onchain avatar
            communities. While projects such as Cryptopunks have attempted to bootstrap
            digital community and identity, Nouns attempt to bootstrap community and
            identity with the additive layer of governance and a treasury.
          </Flex>
        </>
      ),
    },
    {
      title: 'How do I create my artwork?',
      description: (
        <>
          <Flex mb={'x4'}>
            To create generative NFTs with Nouns Builder, you will need a folder of your
            artwork layers in .png or .svg.
          </Flex>
          <Flex mb={'x4'}>
            600px x 600px minimum for pngs, 32px minimum for svgs and must be square
            images.
          </Flex>
          <Flex mb={'x4'}>Image layers can be reordered in the upload flow. </Flex>
          <Flex mb={'x4'}>
            <a href={'/nouns.zip'} download className={defaultFileDownloadStyle}>
              <Icon id="download" />
              <Text ml="x2">Download demo folder</Text>
            </a>
          </Flex>
          <Flex mb={'x4'}>
            <a
              href={'https://www.figma.com/community/file/1166768320345172833'}
              download
              className={defaultFileDownloadStyle}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon id="newWindow" />
              <Text ml="x2">Artwork starter kit</Text>
            </a>
          </Flex>
        </>
      ),
    },
    {
      title: 'How does founder allocation work?',
      description: (
        <>
          <Flex mb={'x4'}>
            Founder allocations are a custom % of tokens over a custom period of time to
            specified wallet addresses. In Nouns DAO, this is 10% of tokens for 5 years
            (token 0, 10, 20 etc) for the DAO founders.
          </Flex>

          <Flex mb={'x4'}>
            Founder distributions don't interfere with the cadence of auctions. Tokens are
            sent directly to the founder’s wallets and auctions continue on schedule with
            the next available ID.
          </Flex>
        </>
      ),
    },
    {
      title: 'How do auctions work?',
      description: (
        <>
          <Flex mb={'x4'}>
            Each auction is a generative NFT, created from your artwork layers.
          </Flex>
          <Flex mb={'x4'}>
            Once the auction is started by the founder, it will run forever. The DAO
            founder can set the auction schedule when they create the DAO. Nouns DAO
            auction cadence is daily.
          </Flex>
          <Flex mb={'x4'}>
            100% of auction sales go to the DAO Treasury and is governed by your
            community.
          </Flex>
        </>
      ),
    },
  ]

  return (
    <Stack
      w={'100%'}
      mx={'auto'}
      mt={'x13'}
      justify={'flex-start'}
      className={homeSectionWrapper}
    >
      <Text fontWeight={'label'} className={homeSectionHeader}>
        FAQ
      </Text>

      <Box mt={'x3'}>
        <Accordion items={items} />
      </Box>
    </Stack>
  )
}
