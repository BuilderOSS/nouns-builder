import { pinataOptions, UploadType } from '@buildeross/ipfs-service'

import { BackendFailedError, InvalidRequestError } from './errors'

const PINATA_API_KEY = process.env.PINATA_API_KEY

if (!PINATA_API_KEY) {
  throw new Error('PINATA_API_KEY environment variable is required')
}

const PINATA_BASE_URL = 'https://api.pinata.cloud'
const PINATA_UPLOAD_URL = 'https://uploads.pinata.cloud'

// JWT key restrictions for upload operations
const UPLOAD_JWT_KEY_RESTRICTIONS = {
  keyName: 'Signed Upload JWT',
  maxUses: 1,
  permissions: {
    endpoints: {
      data: {
        pinList: false,
        userPinnedDataTotal: false,
      },
      pinning: {
        pinFileToIPFS: true,
        pinJSONToIPFS: false,
        pinJobs: false,
        unpin: false,
        userPinPolicy: false,
      },
    },
  },
} as const

// Common Pinata request headers
const getPinataHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${PINATA_API_KEY}`,
})

const DEFAULT_TIMEOUT_MS = 10_000
async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  ms = DEFAULT_TIMEOUT_MS
) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(input, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(id)
  }
}

/**
 * Pin JSON data to IPFS via Pinata and ensure it's also pinned via pin_by_cid
 */
export async function pinJsonToIPFS(
  data: unknown
): Promise<{ cid: string; status: string }> {
  if (!data || typeof data !== 'object') {
    throw new InvalidRequestError('Invalid or missing JSON data')
  }

  try {
    // Step 1: Pin JSON to Pinata (pinJSONToIPFS)
    const pinataPayload = JSON.stringify({
      pinataOptions: {
        cidVersion: 0,
      },
      pinataContent: data,
    })

    const pinRes = await fetchWithTimeout(`${PINATA_BASE_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: getPinataHeaders(),
      body: pinataPayload,
    })

    if (!pinRes.ok) {
      const errorText = await pinRes.text()
      console.error('Error pinning JSON:', errorText)
      throw new BackendFailedError('Failed to pin JSON to Pinata')
    }

    const pinJsonResponse = await pinRes.json()
    const cid = pinJsonResponse.IpfsHash

    if (!cid) {
      throw new BackendFailedError('Missing CID in Pinata response')
    }

    // Step 2: Pin the CID using pin_by_cid
    await pinCidToIPFS({ cid })

    return {
      cid,
      status: 'Pinned successfully',
    }
  } catch (error) {
    if (error instanceof InvalidRequestError || error instanceof BackendFailedError) {
      throw error
    }
    console.error('Pinata JSON pinning error:', error)
    throw new BackendFailedError('Internal server error during JSON pinning')
  }
}

/**
 * Pin an existing CID via Pinata's pin_by_cid endpoint
 */
export async function pinCidToIPFS(options: {
  cid: string
  name?: string
  group_id?: string
}): Promise<{ status: string }> {
  const { cid, name, group_id } = options

  if (!cid) {
    throw new InvalidRequestError('CID is required')
  }

  if (name && name.length > 32) {
    throw new InvalidRequestError('Name is too long (max 32 characters)')
  }

  try {
    const payload: { cid: string; name?: string; group_id?: string } = { cid }
    if (name) payload.name = name
    if (group_id) payload.group_id = group_id

    const pinResponse = await fetchWithTimeout(
      `${PINATA_BASE_URL}/v3/files/public/pin_by_cid`,
      {
        method: 'POST',
        headers: getPinataHeaders(),
        body: JSON.stringify(payload),
      }
    )

    if (!pinResponse.ok) {
      const errorText = await pinResponse.text()
      console.error('Error pinning CID:', errorText)
      throw new BackendFailedError('Failed to pin CID via pin_by_cid')
    }

    return { status: 'CID pinned successfully' }
  } catch (error) {
    if (error instanceof InvalidRequestError || error instanceof BackendFailedError) {
      throw error
    }
    console.error('Pinata CID pinning error:', error)
    throw new BackendFailedError('Internal server error during CID pinning')
  }
}

/**
 * Generate a temporary JWT for file uploads with restricted permissions
 */
export async function generateUploadJWT(): Promise<{ JWT: string }> {
  try {
    const jwtResponse = await fetchWithTimeout(
      `${PINATA_BASE_URL}/users/generateApiKey`,
      {
        method: 'POST',
        headers: getPinataHeaders(),
        body: JSON.stringify(UPLOAD_JWT_KEY_RESTRICTIONS),
      }
    )

    if (!jwtResponse.ok) {
      const errorText = await jwtResponse.text()
      console.error('Error generating JWT:', errorText)
      throw new BackendFailedError('Failed to generate upload JWT')
    }

    const json = await jwtResponse.json()

    if (!json.JWT) {
      throw new BackendFailedError('Missing JWT in Pinata response')
    }

    return { JWT: json.JWT }
  } catch (error) {
    if (error instanceof BackendFailedError) {
      throw error
    }
    console.error('Pinata JWT generation error:', error)
    throw new BackendFailedError('Internal server error during JWT generation')
  }
}

/**
 * Create a signed upload URL for direct file uploads to Pinata
 */
export async function createSignedUploadUrl(type: string): Promise<{ url: string }> {
  if (!type || !pinataOptions[type as UploadType]) {
    throw new InvalidRequestError(
      `Invalid type provided, must be one of: ${Object.keys(pinataOptions).join(', ')}`
    )
  }

  try {
    const options = pinataOptions[type as UploadType]
    const payload = JSON.stringify({
      expires: 30,
      date: Math.floor(new Date().getTime() / 1000),
      ...options,
    })

    const urlRequest = await fetchWithTimeout(`${PINATA_UPLOAD_URL}/v3/files/sign`, {
      method: 'POST',
      headers: getPinataHeaders(),
      body: payload,
    })

    const urlResponse = await urlRequest.json()

    if (!urlResponse.data) {
      console.error('Error creating signed URL:', urlResponse)
      throw new BackendFailedError('Failed to create signed upload URL')
    }

    return { url: urlResponse.data }
  } catch (error) {
    if (error instanceof InvalidRequestError || error instanceof BackendFailedError) {
      throw error
    }
    console.error('Pinata signed URL creation error:', error)
    throw new BackendFailedError('Internal server error during signed URL creation')
  }
}
