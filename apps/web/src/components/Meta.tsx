import Head from 'next/head'
import React from 'react'

import { PUBLIC_IS_TESTNET } from 'src/constants/defaultChains'
import { AddressType, Chain } from 'src/typings'
import { getBaseUrl } from 'src/utils/baseUrl'

interface MetaProps {
  title: string
  slug: string
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

export const Meta: React.FC<MetaProps> = ({
  title,
  type,
  slug,
  image,
  description,
  farcaster,
}) => {
  const baseUrl = getBaseUrl()

  const m = {
    title,
    type,
    description:
      description ??
      'Unlock the possibilities of collective creation. Start with a vision. Start a DAO. All onchain.',
    version: 'next',
    url: `${baseUrl}${slug}`,
    imageUrl: farcaster?.image ?? image ?? `${baseUrl}/social-preview.jpg`,
    button: {
      title,
      action: {
        type: 'launch_frame',
        name: 'Nouns Builder',
        url: `${baseUrl}${slug}`,
        splashImageUrl: `${baseUrl}/noggles-square.png`,
        splashBackgroundColor: '#ffffff',
      },
    },
  }

  return (
    <Head>
      <title>{`Nouns Builder | ${title}`}</title>
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
          <meta property="eth:nft:media_url" content={m.imageUrl} />
        </>
      )}
    </Head>
  )
}
