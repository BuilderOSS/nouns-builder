import { Flex } from '@zoralabs/zord'
import Head from 'next/head'

import { notFoundWrap } from '../styles/404.css'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Nouns Builder | Page Not Found</title>
      </Head>

      <Flex className={notFoundWrap}>404 - Page Not Found</Flex>
    </>
  )
}
