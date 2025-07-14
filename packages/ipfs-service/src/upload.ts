import { hashFiles } from './hash'

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

const uploadWithProgress = async (
  data: FormData,
  uploadType: UploadType,
  onProgress: ProgressCallback,
): Promise<PinataUploadResponse> => {
  const uploadUrlResponse = await fetch('/api/upload-url', {
    method: 'POST',
    body: JSON.stringify({
      type: uploadType,
    }),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })

  if (!uploadUrlResponse.ok) {
    throw new Error('No Signed URL')
  }
  const uploadUrlData = await uploadUrlResponse.json()

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', uploadUrlData.url, true)

    // Add event listener to track upload progress
    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        onProgress(progress) // Call the progress callback
      }
    }

    // Handle successful upload
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const jsonResponse = JSON.parse(xhr.responseText)

        try {
          // ensure cid is pinned if it wasn't already
          fetch('/api/pin-cid', {
            method: 'POST',
            body: JSON.stringify({
              cid: jsonResponse.data.cid,
              name: jsonResponse.data.name,
            }),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          })
        } catch (error) {
          console.error('Error pinning CID', error)
        }
        resolve(jsonResponse.data as PinataUploadResponse)
      } else {
        const jsonResponse = JSON.parse(xhr.responseText)
        reject(new Error(`Upload failed with: ${jsonResponse.error.message}`))
      }
    }

    // Handle errors
    xhr.onerror = (error) => {
      reject(new Error(`Error uploading file: ${error}`))
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
    } catch { }
  },
  put(files: File[], cid: string) {
    const digest = hashFiles(files)
    try {
      localStorage.setItem(`${this.prefix}/${digest}`, cid)
    } catch { }
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
  },
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
      `File size exceeds limit of ${formatFileSize(uploadOptions.max_file_size)}`,
    )
  }

  if (cache) {
    const cached = uploadCache.get([file])
    if (cached) return cached
  }

  const data = new FormData()
  data.append('file', file)

  const response = (await uploadWithProgress(data, uploadType, (progress) => {
    console.info(`ipfs-service/uploadFile: progress: ${progress}%`)
    // You can also update the UI with the progress here
    if (typeof onProgress === 'function') {
      onProgress(progress)
    }
  })) as any

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
  },
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
      `Directory size exceeds limit of ${formatFileSize(pinataOptions.directory.max_file_size)}`,
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
    }),
  )
  data.append(
    'pinataMetadata',
    JSON.stringify({
      name: 'builder',
    }),
  )

  const response = (await uploadWithProgress(data, 'directory', (progress) => {
    console.info(`ipfs-service/uploadDirectory: progress: ${progress}%`)
    // You can also update the UI with the progress here
    if (typeof onProgress === 'function') {
      onProgress(progress)
    }
  })) as any

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

  const response = await fetch('/api/pin-json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
