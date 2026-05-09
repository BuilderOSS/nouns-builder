import Head from 'next/head'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import { AboutPageView } from 'src/modules/about'

import { NextPageWithLayout } from './_app'

const AboutPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Nouns Builder | About</title>
      </Head>
      <AboutPageView />
    </>
  )
}

AboutPage.getLayout = getDefaultLayout

export default AboutPage
