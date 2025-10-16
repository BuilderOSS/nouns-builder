import { NextPage } from 'next'
import Head from 'next/head'

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About | DAO</title>
        <meta name="description" content="About our DAO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{ padding: '2rem' }}>
        <h1>About</h1>
        <p>About page - coming soon</p>
      </main>
    </>
  )
}

export default AboutPage
