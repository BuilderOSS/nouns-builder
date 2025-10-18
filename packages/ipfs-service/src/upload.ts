import { hashFiles } from './hash'

// NOTE/TODO: Currently this service only supports Pinata as the IPFS provider.
// Ideally we should support multiple IPFS providers (e.g., Infura, Web3.Storage, etc.)
// and allow developers to choose between them. Additionally, the API endpoints are
// hardcoded to specific paths (/api/pinata/*), which means developers must implement
// the same endpoint structure in their applications for this service to work.

const defaultOptions = {
  onProgress: undefined,
  cache: true,
}

export type IPFSUploadResponse = {
  cid: string
  uri: string
}

export type PinataUploadResponse = {
  cid: string
}

export type ProgressCallback = (progress: number) => void

export type UploadType = 'file' | 'image' | 'media' | 'directory' | 'json'

export type PinataOptions = {
  max_file_size: number
  allow_mime_types: string[]
}

export const pinataOptions: Record<UploadType, PinataOptions> = {
  file: {
    max_file_size: 10 * 1024 * 1024,
    allow_mime_types: [
      // Image types
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Video types
      'video/mp4',
      'video/webm',
      'video/quicktime',
      // Audio types
      'audio/mpeg',
      'audio/ogg',
      'audio/wav',
      // Documents and data
      'application/pdf',
      'application/json',
      // Plain text only (not html/js)
      'text/plain',
    ],
  },
  json: {
    max_file_size: 10 * 1024,
    allow_mime_types: ['application/json'],
  },
  image: {
    max_file_size: 1 * 1024 * 1024,
    allow_mime_types: [
      // Image types
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
  },
  media: {
    max_file_size: 50 * 1024 * 1024,
    allow_mime_types: [
      // Image types
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Video types
      'video/mp4',
      'video/webm',
      'video/quicktime',
      // Audio types
      'audio/mpeg',
      'audio/ogg',
      'audio/wav',
    ],
  },
  directory: {
    max_file_size: 200 * 1024 * 1024,
    allow_mime_types: ['directory'],
  },
}

type UploadOptions = {
  useLegacy?: boolean
  onProgress?: ProgressCallback
}

async function getUploadTarget(useLegacy: boolean, uploadType: UploadType) {
  // TODO: support directory in pinata v3 once supported by pinata
  if (useLegacy) {
    const res = await fetch(`/api/pinata/generate-jwt`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error('No Pinata JWT')
    const { JWT } = await res.json()
    return {
      uploadUrl: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      jwt: JWT as string,
    }
  } else {
    const res = await fetch(`/api/pinata/upload-url`, {
      method: 'POST',
      body: JSON.stringify({ type: uploadType }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
    if (!res.ok) throw new Error('No Signed URL')
    const data = await res.json()
    return { uploadUrl: data.url as string, jwt: undefined }
  }
}

export async function uploadWithProgress(
  data: FormData,
  uploadType: UploadType,
  options: UploadOptions = {}
): Promise<PinataUploadResponse> {
  const { useLegacy = false, onProgress } = options

  const { uploadUrl, jwt } = await getUploadTarget(useLegacy, uploadType)
  if (!uploadUrl) throw new Error('No upload URL')
  if (useLegacy && !jwt) throw new Error('No JWT for legacy upload')

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', uploadUrl, true)
    if (useLegacy) {
      xhr.setRequestHeader('Authorization', `Bearer ${jwt}`)
    }

    // Add event listener to track upload progress
    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        onProgress?.(progress) // Call the progress callback
      }
    }

    // Handle successful upload
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const jsonResponse = JSON.parse(xhr.responseText)

        let cid: string | undefined

        if (useLegacy) {
          cid = jsonResponse.IpfsHash
        } else {
          cid = jsonResponse.data.cid
        }

        const result = { cid } as PinataUploadResponse

        try {
          // ensure cid is pinned if it wasn't already
          fetch(`/api/pinata/pin-cid`, {
            method: 'POST',
            body: JSON.stringify(result),
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          })
        } catch (error) {
          console.error('Error pinning CID', error)
        }
        resolve(result)
      } else {
        try {
          const jsonResponse = JSON.parse(xhr.responseText)
          const msg =
            jsonResponse?.error?.message ||
            jsonResponse?.message ||
            xhr.statusText ||
            'Unknown error'
          reject(new Error(`Upload failed: ${msg}`))
        } catch {
          reject(
            new Error(
              `Upload failed (${xhr.status}): ${xhr.responseText?.slice(0, 256) || 'No body'}`
            )
          )
        }
      }
    }

    // Handle errors
    xhr.onerror = (event: ProgressEvent) => {
      console.error('Error uploading file:', event)
      reject(new Error(`Error uploading file: Network error`))
    }

    // Send the FormData
    xhr.send(data)
  })
}

const uploadCache = {
  prefix: 'BUILDER/IPFSUploadCache',
  get(files: File[]): IPFSUploadResponse | undefined {
    const digest = hashFiles(files)
    try {
      const cid = localStorage.getItem(`${this.prefix}/${digest}`)
      console.info('ipfs-service/uploadCache', cid ? 'HIT' : 'MISS', digest, cid)
      if (cid) {
        return { cid, uri: `ipfs://${cid}` }
      }
    } catch {}
  },
  put(files: File[], cid: string) {
    const digest = hashFiles(files)
    try {
      localStorage.setItem(`${this.prefix}/${digest}`, cid)
    } catch {}
  },
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`
  } else if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  } else if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`
  }
  return `${bytes}B`
}

export async function uploadFile(
  file: File,
  options?: {
    type?: Omit<UploadType, 'json'>
    onProgress?: ProgressCallback
    cache?: boolean
  }
): Promise<IPFSUploadResponse> {
  console.info('ipfs-service/uploadFile: file:', file)

  const { onProgress, cache, type } = {
    ...defaultOptions,
    ...options,
  }

  const uploadType = (type ?? 'file') as UploadType
  const uploadOptions = pinataOptions[uploadType]

  if (file.size > uploadOptions.max_file_size) {
    throw new Error(
      `File size exceeds limit of ${formatFileSize(uploadOptions.max_file_size)}`
    )
  }

  if (cache) {
    const cached = uploadCache.get([file])
    if (cached) return cached
  }

  const data = new FormData()
  data.append('file', file)
  data.append('network', 'public')

  const progressCallback = (progress: number) => {
    console.info(`ipfs-service/uploadFile: progress: ${progress}%`)
    // You can also update the UI with the progress here
    if (typeof onProgress === 'function') {
      onProgress(progress)
    }
  }

  const response = await uploadWithProgress(data, uploadType, {
    onProgress: progressCallback,
  })

  const uri = `ipfs://${response.cid}`

  console.info('ipfs-service/uploadFile: response:', response)

  uploadCache.put([file], response.cid)

  return {
    ...response,
    uri,
  }
}

export type FileEntry =
  | File
  | {
      content: File
      path: string
    }

export async function uploadDirectory(
  fileEntries: FileEntry[],
  options?: {
    onProgress?: (progress: number) => void
    cache?: boolean
  }
): Promise<IPFSUploadResponse> {
  console.info('ipfs-service/uploadDirectory: files:', fileEntries)
  let totalSize = 0
  const entries = fileEntries.map((entry) => {
    if (entry instanceof File) {
      totalSize += entry.size
      return {
        content: entry,
        path: entry.name,
      }
    }
    totalSize += entry.content.size
    return entry
  })

  if (totalSize > pinataOptions.directory.max_file_size) {
    throw new Error(
      `Directory size exceeds limit of ${formatFileSize(pinataOptions.directory.max_file_size)}`
    )
  }

  const files = entries.map((entry) => entry.content)

  const { onProgress, cache } = {
    ...defaultOptions,
    ...options,
  }

  if (cache) {
    const cached = uploadCache.get(files)
    if (cached) return cached
  }

  const data = new FormData()
  entries.forEach((file) => {
    data.append('file', file.content, `builder/${file.path}`)
  })
  data.append(
    'pinataOptions',
    JSON.stringify({
      cidVersion: 1,
    })
  )
  data.append(
    'pinataMetadata',
    JSON.stringify({
      name: 'builder',
    })
  )
  data.append('network', 'public')

  const progressCallback = (progress: number) => {
    console.info(`ipfs-service/uploadDirectory: progress: ${progress}%`)
    // You can also update the UI with the progress here
    if (typeof onProgress === 'function') {
      onProgress(progress)
    }
  }

  const response = await uploadWithProgress(data, 'directory', {
    onProgress: progressCallback,
    useLegacy: true,
  })

  const uri = `ipfs://${response.cid}`

  console.info('ipfs-service/uploadDirectory: response:', response)

  uploadCache.put(files, response.cid)

  return {
    ...response,
    uri,
  }
}

export async function uploadJson(jsonObject: object): Promise<IPFSUploadResponse> {
  console.info('ipfs-service/uploadJson: json:', jsonObject)
  if (!jsonObject || typeof jsonObject !== 'object') {
    throw new Error('Invalid JSON data')
  }

  const data = JSON.stringify(jsonObject)

  const response = await fetch(`/api/pinata/pin-json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: data,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`JSON upload failed: ${errorText}`)
  }

  const json = await response.json()

  const cid = json.cid
  if (!cid) {
    throw new Error('No CID returned from API')
  }

  console.info('ipfs-service/uploadJson: response:', json)

  return {
    cid,
    uri: `ipfs://${cid}`,
  }
}
