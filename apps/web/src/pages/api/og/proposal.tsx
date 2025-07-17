import { getFetchableUrls } from '@buildeross/ipfs-service'
import { CHAIN_ID } from '@buildeross/types'
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

import { PUBLIC_DEFAULT_CHAINS } from 'src/constants/chains'
import { ProposalState } from 'src/data/contract/requests/getProposalState'
import { Proposal } from 'src/data/subgraph/requests/proposalQuery'
import NogglesLogo from 'src/layouts/assets/builder-framed.svg'
import { bgForAddress } from 'src/utils/gradient'

export const config = {
  runtime: 'edge',
}

export function parseState(state: ProposalState) {
  switch (state) {
    case ProposalState.Pending:
      return 'Pending'
    case ProposalState.Active:
      return 'Active'
    case ProposalState.Canceled:
      return 'Cancelled'
    case ProposalState.Defeated:
      return 'Defeated'
    case ProposalState.Succeeded:
      return 'Succeeded'
    case ProposalState.Queued:
      return 'Queued'
    case ProposalState.Expired:
      return 'Expired'
    case ProposalState.Executed:
      return 'Executed'
    case ProposalState.Vetoed:
      return 'Vetoed'
    default:
      return 'Loading'
  }
}

export function parseBgColor(state: ProposalState) {
  switch (state) {
    case ProposalState.Pending:
    case ProposalState.Active:
    case ProposalState.Succeeded:
      return {
        borderColor: 'rgba(28, 182, 135, 0.1)',
        color: '#1CB687',
      }
    case ProposalState.Defeated:
      return {
        borderColor: 'rgba(240, 50, 50, 0.1)',
        color: '#F03232',
      }
    case ProposalState.Executed:
      return {
        borderColor: 'rgba(37, 124, 237, 0.1)',
        color: '#257CED',
      }
    case ProposalState.Queued:
      return {
        borderColor: '#F2E2F7',
        color: '#D16BE1',
      }
    case ProposalState.Expired:
    default:
      return { borderColor: '#F2F2F2', color: '#B3B3B3' }
  }
}

const ptRootRegular = fetch(
  new URL('public/fonts/pt-root-ui_regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

const ptRootMedium = fetch(
  new URL('public/fonts/pt-root-ui_medium.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

const ptRootBold = fetch(
  new URL('public/fonts/pt-root-ui_bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

export type ProposalOgMetadata = {
  chainId: CHAIN_ID
  tokenAddress: string
  daoName: string
  daoImage: string
  proposal: Pick<
    Proposal,
    'proposalNumber' | 'title' | 'forVotes' | 'againstVotes' | 'abstainVotes' | 'state'
  >
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawData = searchParams.get('data')

  if (!rawData) return new Response(undefined, { status: 400 })

  const data: ProposalOgMetadata = JSON.parse(rawData)
  const chain = PUBLIC_DEFAULT_CHAINS.find((c) => c.id === data.chainId)

  const [ptRootRegularData, ptRootMediumData, ptRootBoldData] = await Promise.all([
    ptRootRegular,
    ptRootMedium,
    ptRootBold,
  ])

  const proposalStatusColor = parseBgColor(data.proposal.state)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          position: 'relative',
          justifyContent: 'space-around',
          backgroundColor: 'white',
          padding: '100px',
          width: '100%',
          height: '100%',
          fontFamily: 'PT Root UI',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            top: 50,
            left: 95,
          }}
        >
          <NogglesLogo
            fill={'white'}
            width="120"
            style={{ objectFit: 'contain', paddingRight: '2px' }}
            alt="logo"
          />
          <p style={{ marginLeft: '10px', fontWeight: 500, fontSize: '24px' }}>Builder</p>
        </div>
        <div style={{ display: 'flex', position: 'absolute', bottom: 50, right: 95 }}>
          <p style={{ fontSize: '28px', color: '#808080' }}>nouns.build</p>
        </div>
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            alignItems: 'center',
            bottom: 50,
            left: 95,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: bgForAddress(data.tokenAddress ?? '', data.daoImage),
              height: '52px',
              width: '52px',
              borderRadius: '9999px',
              marginRight: '10px',
            }}
          >
            {data.daoImage && (
              <img
                alt="user image"
                src={getFetchableUrls(data.daoImage)?.[0]}
                style={{
                  height: '52px',
                  width: '52px',
                  borderRadius: '9999px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '28px', fontWeight: 700 }}>{data.daoName}</p>
          </div>
          {chain && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #f2f2f2',
                borderRadius: '8px',
                padding: '0px 10px',
                marginLeft: '10px',
                height: '40px',
              }}
            >
              <img
                style={{
                  height: 20,
                  objectFit: 'cover',
                  objectPosition: 'center',
                  marginRight: '10px',
                }}
                src={process.env.BASE_URL + chain.icon}
                alt={chain.name}
              />
              <p
                style={{
                  fontSize: '20px',
                  fontWeight: 500,
                  padding: '0px',
                }}
              >
                {chain.name}
              </p>
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  marginRight: '12px',
                  color: '#808080',
                }}
              >
                Proposal {data.proposal.proposalNumber}
              </p>
              <p
                style={{
                  border: '2px solid',
                  borderColor: proposalStatusColor.borderColor,
                  borderRadius: '9999px',
                  padding: '4px 12px',
                  color: proposalStatusColor.color,
                  fontWeight: 500,
                }}
              >
                {parseState(data.proposal.state)}
              </p>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>{data.proposal.title}</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p
                style={{
                  fontSize: '24px',
                  fontWeight: 400,
                  marginRight: '42px',
                }}
              >
                For{' '}
                <span style={{ marginLeft: '6px', color: '#1CB687', fontWeight: 700 }}>
                  {data.proposal.forVotes}
                </span>
              </p>
              <p
                style={{
                  fontSize: '24px',
                  fontWeight: 400,
                  marginRight: '42px',
                }}
              >
                Against{' '}
                <span style={{ marginLeft: '6px', color: '#F03232', fontWeight: 700 }}>
                  {data.proposal.againstVotes}
                </span>
              </p>
              <p
                style={{
                  fontSize: '24px',
                  fontWeight: 400,
                }}
              >
                Abstain{' '}
                <span style={{ marginLeft: '6px', color: '#808080', fontWeight: 700 }}>
                  {data.proposal.abstainVotes}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
      fonts: [
        {
          name: 'PT Root UI',
          data: ptRootRegularData,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'PT Root UI',
          data: ptRootMediumData,
          style: 'normal',
          weight: 500,
        },
        {
          name: 'PT Root UI',
          data: ptRootBoldData,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}
