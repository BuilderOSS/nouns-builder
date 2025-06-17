import { ImageResponse } from '@vercel/og'
import { getFetchableUrls } from 'ipfs-service/src/gateway'
import { NextRequest } from 'next/server'
import { formatEther } from 'viem'

import { PUBLIC_DEFAULT_CHAINS } from 'src/constants/defaultChains'
import { RPC_URL } from 'src/constants/rpc'
import NogglesLogo from 'src/layouts/assets/builder-framed.svg'
import { CHAIN_ID } from 'src/typings'
import { bgForAddress } from 'src/utils/gradient'
import { formatCryptoVal } from 'src/utils/numbers'

export type DaoOgMetadata = {
  tokenAddress: string
  ownerCount: number
  proposalCount: number
  name: string | undefined
  totalSupply: number | undefined
  contractImage: string | undefined
  chainId: CHAIN_ID
  treasuryAddress: string
}

export const config = {
  runtime: 'edge',
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

const getTreasuryBalance = async (chainId: CHAIN_ID, address: string) => {
  // Generate a random request ID
  const requestId = Math.floor(Math.random() * 1_000_000)

  // Query balance directly from the RPC (edge runtime compatible)
  const { result } = await fetch(RPC_URL[chainId], {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: requestId,
    }),
  }).then((x) => x.json())

  // Convert to ETH value
  const balanceInWei = BigInt(result)
  const balanceInEth = formatEther(balanceInWei)
  const data = formatCryptoVal(balanceInEth)

  return data
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawData = searchParams.get('data')

  if (!rawData) return new Response(undefined, { status: 400 })

  const data: DaoOgMetadata = JSON.parse(rawData)
  const chain = PUBLIC_DEFAULT_CHAINS.find((c) => c.id === data.chainId)

  const [ptRootRegularData, ptRootMediumData, ptRootBoldData] = await Promise.all([
    ptRootRegular,
    ptRootMedium,
    ptRootBold,
  ])

  const daoDataWithLabel = (label: string, data: string | React.ReactElement) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid #f2f2f2',
          justifyItems: 'center',
          padding: '20px',
          paddingTop: '0px',
          paddingBottom: '0px',
          marginRight: '15px',
          borderRadius: '12px',
        }}
      >
        <p style={{ marginBottom: 10, fontSize: '16px', color: '#808080' }}>{label}</p>
        {typeof data === 'string' ? (
          <p style={{ fontSize: '28px', fontWeight: 700, marginTop: 0 }}>{data}</p>
        ) : (
          data
        )}
      </div>
    )
  }

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: bgForAddress(data.tokenAddress ?? '', data.contractImage),
              height: '180px',
              width: '180px',
              borderRadius: '9999px',
              marginRight: '40px',
            }}
          >
            {data.contractImage && (
              <img
                alt="user image"
                src={getFetchableUrls(data.contractImage)?.[0]}
                style={{
                  height: '180px',
                  width: '180px',
                  borderRadius: '9999px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <p style={{ fontSize: '32px', fontWeight: 700 }}>{data.name}</p>
            </div>
            <div style={{ display: 'flex' }}>
              {daoDataWithLabel(
                'Treasury',
                await getTreasuryBalance(data.chainId, data.treasuryAddress)
              )}
              {daoDataWithLabel('Owners', data.ownerCount.toString())}
              {daoDataWithLabel(
                'Total supply',
                data.totalSupply ? data.totalSupply.toString() : '0'
              )}
              {daoDataWithLabel('Proposals', data.proposalCount.toString())}

              {chain
                ? daoDataWithLabel(
                    'Chain',
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '-16px',
                      }}
                    >
                      <img
                        style={{
                          height: 24,
                          objectFit: 'cover',
                          objectPosition: 'center',
                          marginRight: '10px',
                        }}
                        src={process.env.BASE_URL + chain.icon}
                        alt={chain.name}
                      />
                      <p
                        style={{
                          fontSize: '28px',
                          fontWeight: 700,
                        }}
                      >
                        {chain.name}
                      </p>
                    </div>
                  )
                : null}
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
