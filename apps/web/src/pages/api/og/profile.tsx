/* eslint-disable @next/next/no-img-element */

import { getFetchableUrls } from '@buildeross/ipfs-service'
import { MyDaosResponse } from '@buildeross/sdk/subgraph'
import { getEnsAvatar, getEnsName } from '@buildeross/utils/ens'
import { bgForAddress } from '@buildeross/utils/gradient'
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import NogglesLogo from 'src/layouts/assets/builder-framed.svg'
import { isAddress } from 'viem'

const walletSnippet = (_addr: string) =>
  _addr.substring(0, 5) + '...' + _addr.substring(_addr.length - 5, _addr.length)

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

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')
  const rawData = searchParams.get('data')

  if (!rawData) return new Response(undefined, { status: 400 })

  if (!address || !isAddress(address)) return new Response(undefined, { status: 400 })

  const ens = await getEnsName(address)

  const displayName = ens === address ? walletSnippet(address) : ens

  const avatar = ens === address ? '' : await getEnsAvatar(ens)

  const { daos }: { daos: MyDaosResponse } = JSON.parse(rawData)

  const [ptRootRegularData, ptRootMediumData, ptRootBoldData] = await Promise.all([
    ptRootRegular,
    ptRootMedium,
    ptRootBold,
  ])

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
