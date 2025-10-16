import { NextPage } from 'next'
import { useRouter } from 'next/router'

const TokenDetailPage: NextPage = () => {
  const router = useRouter()
  const { tokenId } = router.query

  return (
    <div>
      <h1>Token {tokenId}</h1>
      <p>Token detail page - coming soon</p>
    </div>
  )
}

export default TokenDetailPage
