import { Flex } from '@buildeross/zord'
import Head from 'next/head'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'

import { notFoundWrap } from '../styles/404.css'

const Custom404Page = () => {
  return (
    <>
      <Head>
        <title>Nouns Builder | Page Not Found</title>
      </Head>

      <Flex className={notFoundWrap}>404 - Page Not Found</Flex>
    </>
  )
}

Custom404Page.getLayout = getDefaultLayout

export default Custom404Page
