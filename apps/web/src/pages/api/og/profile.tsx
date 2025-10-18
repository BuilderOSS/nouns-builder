/* eslint-disable @next/next/no-img-element */

import { getFetchableUrls } from '@buildeross/ipfs-service'
import { MyDaosResponse } from '@buildeross/sdk/subgraph'
import { getEnsAvatar, getEnsName } from '@buildeross/utils/ens'
import { bgForAddress } from '@buildeross/utils/gradient'
import { NextRequest } from 'next/server'
import {
  baseContainerStyle,
  createOGImageResponse,
  getFontsData,
  handleBadRequest,
  handleHead,
  handleOptions,
  OGFooter,
  OGHeader,
} from 'src/utils/api/og'
import { isAddress } from 'viem'

const walletSnippet = (_addr: string) =>
  _addr.substring(0, 5) + '...' + _addr.substring(_addr.length - 5, _addr.length)

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return handleOptions()
  }

  if (req.method === 'HEAD') {
    return handleHead()
  }

  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')?.toLowerCase()
  const rawData = searchParams.get('data')

  if (!rawData || !address || !isAddress(address)) {
    return handleBadRequest()
  }

  const ens = (await getEnsName(address))?.toLowerCase()

  const displayName = ens === address ? walletSnippet(address) : ens

  const avatar = ens === address ? '' : await getEnsAvatar(ens)

  const { daos }: { daos: MyDaosResponse } = JSON.parse(rawData)

  const fontsData = await getFontsData()

  return createOGImageResponse(
    <div style={baseContainerStyle}>
      <OGHeader />
      <OGFooter />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 50,
          right: 95,
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: bgForAddress(address, avatar),
            height: '36px',
            width: '36px',
            borderRadius: '9999px',
          }}
        >
          {avatar && (
            <img
              alt="user image"
              src={avatar}
              style={{
                height: '36px',
                width: '36px',
                borderRadius: '9999px',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          )}
        </div>
        <p style={{ fontSize: '32px', fontWeight: 700 }}>{displayName}</p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '24px',
        }}
      >
        <p style={{ fontSize: '32px', fontWeight: 700 }}>DAOs</p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          {daos.slice(0, 6).map((dao) => {
            return (
              <div
                key={dao.collectionAddress}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  border: '2px solid #f2f2f2',
                  justifyItems: 'center',
                  padding: '20px',
                  paddingTop: '0px',
                  paddingBottom: '0px',
                  borderRadius: '12px',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: bgForAddress(
                      dao.collectionAddress ?? '',
                      dao.contractImage
                    ),
                    height: '48px',
                    width: '48px',
                    borderRadius: '9999px',
                    marginTop: '12px',
                  }}
                >
                  {dao.contractImage && (
                    <img
                      alt="user image"
                      src={getFetchableUrls(dao.contractImage)?.[0]}
                      style={{
                        height: '48px',
                        width: '48px',
                        borderRadius: '9999px',
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                    />
                  )}
                </div>
                <p style={{ fontSize: '32px', fontWeight: 700 }}>{dao.name}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>,
    fontsData
  )
}
