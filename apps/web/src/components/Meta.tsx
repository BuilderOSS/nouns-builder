import { AddressType, Chain } from '@buildeross/types'
import Head from 'next/head'
import React from 'react'

import { BASE_URL } from 'src/constants/baseUrl'
import { PUBLIC_IS_TESTNET } from 'src/constants/chains'

interface MetaProps {
  title: string
  path: string
  type?: string
  image?: string
  description?: string
  farcaster?: {
    name: string
    contractAddress: AddressType
    chain: Chain
    image?: string
  }
}

const trimTitle = (title: string) => {
  if (title.length > 32) {
    return title.slice(0, 31) + '…'
  }
  return title
}

export const Meta: React.FC<MetaProps> = ({
  title,
  type,
  path,
  image,
  description,
  farcaster,
}) => {
  const name = PUBLIC_IS_TESTNET ? 'Testnet Nouns Builder' : 'Nouns Builder'

  // eslint-disable-next-line no-param-reassign
  path = path.startsWith('/') ? path : '/' + path

  // eslint-disable-next-line no-param-reassign
  title = trimTitle(title)

  const m = {
    title,
    type,
    description:
      description ??
      'Unlock the possibilities of collective creation. Start with a vision. Start a DAO. All onchain.',
    version: 'next',
    url: `${BASE_URL}${path}`,
    imageUrl: image ?? `${BASE_URL}/social-preview.jpg`,
    button: {
      title,
      action: {
        type: 'launch_frame',
        name,
        url: `${BASE_URL}${path}`,
        splashImageUrl: `${BASE_URL}/noggles-square.png`,
        splashBackgroundColor: '#ffffff',
      },
    },
  }

  return (
    <Head>
      <title>{`${name} | ${title}`}</title>
      <meta property="og:title" content={title} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={m.url} />
      <meta property="og:image" content={m.imageUrl} />
      <meta property="og:description" content={m.description} />
      {PUBLIC_IS_TESTNET && <meta name="robots" content="noindex" />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@nounsbuilder" />
      <meta name="twitter:creator" content="@nounsbuilder" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:url" content={m.url} />
      <meta name="twitter:description" content={m.description} />
      <meta name="twitter:image" content={m.imageUrl} />

      <meta name="fc:frame" content={`${JSON.stringify(m)}`} />
      {/* Warpcast-specific NFT meta tags: https://warpcast.notion.site/NFT-extended-Open-Graph-Spec-4e350bd8e4c34e3b86e77d58bf1f5575 */}
      {/* TODO: Remove any deprecated frame v1 meta tags */}
      {farcaster && (
        <>
          <meta property="eth:nft:collection" content={farcaster.name} />
          <meta property="eth:nft:contract_address" content={farcaster.contractAddress} />
          <meta property="eth:nft:creator_address" content={farcaster.contractAddress} />
          <meta property="eth:nft:schema" content="erc721" />
          <meta property="eth:nft:chain" content={farcaster.chain.slug} />
          <meta property="eth:nft:media_url" content={farcaster.image} />
        </>
      )}
    </Head>
  )
}
