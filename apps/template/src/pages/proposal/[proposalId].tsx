import { NextPage } from 'next'
import { useRouter } from 'next/router'

const ProposalDetailPage: NextPage = () => {
  const router = useRouter()
  const { proposalId } = router.query

  return (
    <div>
      <h1>Proposal {proposalId}</h1>
      <p>Proposal detail page - coming soon</p>
    </div>
  )
}

export default ProposalDetailPage
