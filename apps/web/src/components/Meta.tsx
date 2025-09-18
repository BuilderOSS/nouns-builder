import { BASE_URL } from '@buildeross/constants/baseUrl'
import { PUBLIC_IS_TESTNET } from '@buildeross/constants/chains'
import Head from 'next/head'
import React from 'react'

interface MetaProps {
  title: string
  path: string
  type?: string
  image?: string
  description?: string
}

const trimTitle = (title: string) => {
  if (title.length > 32) {
    return title.slice(0, 31) + '…'
  }
  return title
}

export const Meta: React.FC<MetaProps> = ({ title, type, path, image, description }) => {
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
    </Head>
  )
}
