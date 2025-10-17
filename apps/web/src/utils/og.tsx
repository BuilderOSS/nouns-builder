/* eslint-disable @next/next/no-img-element */

import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import NogglesLogo from 'src/layouts/assets/builder-framed.svg'

export const config = {
  runtime: 'edge',
}

// Font loading - shared across all OG endpoints
export const ptRootRegular = fetch(
  new URL('public/fonts/pt-root-ui_regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

export const ptRootMedium = fetch(
  new URL('public/fonts/pt-root-ui_medium.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

export const ptRootBold = fetch(
  new URL('public/fonts/pt-root-ui_bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

// CORS headers
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle OPTIONS requests
export function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  })
}

// Handle HEAD requests
export function handleHead() {
  return new Response(null, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'image/png',
      'Content-Length': '0',
    },
  })
}

// Handle bad requests
export function handleBadRequest() {
  return new Response(undefined, {
    status: 400,
    headers: CORS_HEADERS,
  })
}

// Get fonts data
export async function getFontsData() {
  return Promise.all([ptRootRegular, ptRootMedium, ptRootBold])
}

// Font configuration for ImageResponse
export function getFontConfig(
  ptRootRegularData: ArrayBuffer,
  ptRootMediumData: ArrayBuffer,
  ptRootBoldData: ArrayBuffer
) {
  return [
    {
      name: 'PT Root UI',
      data: ptRootRegularData,
      style: 'normal' as const,
      weight: 400 as const,
    },
    {
      name: 'PT Root UI',
      data: ptRootMediumData,
      style: 'normal' as const,
      weight: 500 as const,
    },
    {
      name: 'PT Root UI',
      data: ptRootBoldData,
      style: 'normal' as const,
      weight: 700 as const,
    },
  ]
}

// Base container styles
export const baseContainerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start' as const,
  position: 'relative' as const,
  justifyContent: 'space-around' as const,
  backgroundColor: 'white',
  padding: '100px',
  width: '100%',
  height: '100%',
  fontFamily: 'PT Root UI',
}

// Header component with logo and "Builder" text
export function OGHeader() {
  return (
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
  )
}

// Footer component with "nouns.build" text
export function OGFooter() {
  return (
    <div style={{ display: 'flex', position: 'absolute', bottom: 50, right: 95 }}>
      <p style={{ fontSize: '28px', color: '#808080' }}>nouns.build</p>
    </div>
  )
}

// Create ImageResponse with shared configuration
export function createOGImageResponse(
  content: React.ReactElement,
  fontsData: ArrayBuffer[]
) {
  const [ptRootRegularData, ptRootMediumData, ptRootBoldData] = fontsData

  const imageResponse = new ImageResponse(content, {
    width: 1200,
    height: 800,
    fonts: getFontConfig(ptRootRegularData, ptRootMediumData, ptRootBoldData),
  })

  // Add CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    imageResponse.headers.set(key, value)
  })

  return imageResponse
}

type RequestDataSuccess<T> = {
  data: T
  error: null
}

type RequestDataError = {
  data: null
  error: Response
}

// Parse and validate request data
export function parseRequestData<T>(
  req: NextRequest
): RequestDataSuccess<T> | RequestDataError {
  const { searchParams } = new URL(req.url)
  const rawData = searchParams.get('data')

  if (!rawData) {
    return { data: null, error: handleBadRequest() } as RequestDataError
  }

  try {
    const data: T = JSON.parse(rawData)
    return { data, error: null } as RequestDataSuccess<T>
  } catch {
    return { data: null, error: handleBadRequest() } as RequestDataError
  }
}
