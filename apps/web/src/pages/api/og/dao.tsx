/* eslint-disable @next/next/no-img-element */

import { BASE_URL } from '@buildeross/constants/baseUrl'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { getFetchableUrls } from '@buildeross/ipfs-service/gateway'
import { CHAIN_ID } from '@buildeross/types'
import { bgForAddress } from '@buildeross/utils/gradient'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { serverConfig } from '@buildeross/utils/wagmi/serverConfig'
import { NextRequest } from 'next/server'
import {
  baseContainerStyle,
  createOGImageResponse,
  getFontsData,
  handleHead,
  handleOptions,
  OGFooter,
  OGHeader,
  parseRequestData,
} from 'src/utils/og'
import { formatEther } from 'viem'
import { getBalance } from 'wagmi/actions'

export type DaoOgMetadata = {
  tokenAddress: `0x${string}`
  ownerCount: number
  proposalCount: number
  name: string | undefined
  totalSupply: number | undefined
  contractImage: string | undefined
  chainId: CHAIN_ID
  treasuryAddress: `0x${string}`
}

export const config = {
  runtime: 'edge',
}

const getTreasuryBalance = async (
  chainId: CHAIN_ID,
  address: `0x${string}`
): Promise<string> => {
  const result = await getBalance(serverConfig, {
    address,
    chainId,
    blockTag: 'latest',
  })

  // Convert to ETH value
  const balanceInWei = BigInt(result.value)
  const balanceInEth = formatEther(balanceInWei)
  const data = formatCryptoVal(balanceInEth)

  return data
}

export default async function handler(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return handleOptions()
  }

  if (req.method === 'HEAD') {
    return handleHead()
  }

  const { data, error } = parseRequestData<DaoOgMetadata>(req)
  if (error) return error
  const chain = PUBLIC_DEFAULT_CHAINS.find((c) => c.id === data.chainId)

  const fontsData = await getFontsData()

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

  return createOGImageResponse(
    <div style={baseContainerStyle}>
      <OGHeader />
      <OGFooter />
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
                      src={BASE_URL + chain.icon}
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
    </div>,
    fontsData
  )
}
