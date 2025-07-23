# @buildeross/ipfs-service

IPFS utilities for BuilderOSS applications, providing file upload, directory upload, JSON pinning, and gateway management with comprehensive caching and progress tracking.

## Installation

```bash
pnpm install @buildeross/ipfs-service
```

## Features

- **File Upload**: Single file upload to IPFS via Pinata
- **Directory Upload**: Batch directory upload with path preservation
- **JSON Pinning**: Direct JSON object upload to IPFS
- **Gateway Management**: Multiple IPFS gateway support with fallbacks
- **Progress Tracking**: Real-time upload progress monitoring
- **Caching**: Local storage caching to prevent duplicate uploads
- **URL Normalization**: IPFS URL parsing and normalization utilities
- **Type Safety**: Full TypeScript support with proper typing

## Usage

### File Upload

Upload single files with progress tracking and caching:

```typescript
import { uploadFile } from '@buildeross/ipfs-service'

async function handleFileUpload(file: File) {
  try {
    const result = await uploadFile(file, {
      type: 'image', // 'file' | 'image' | 'media'
      cache: true,
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`)
      }
    })

    console.log('IPFS CID:', result.cid)
    console.log('IPFS URI:', result.uri) // ipfs://...
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### Directory Upload

Upload multiple files as a directory structure:

```typescript
import { uploadDirectory } from '@buildeross/ipfs-service'

async function handleDirectoryUpload(files: File[]) {
  const fileEntries = files.map(file => ({
    content: file,
    path: `assets/${file.name}`
  }))

  try {
    const result = await uploadDirectory(fileEntries, {
      cache: true,
      onProgress: (progress) => {
        console.log(`Directory upload: ${progress}%`)
      }
    })

    console.log('Directory CID:', result.cid)
    console.log('Directory URI:', result.uri)
  } catch (error) {
    console.error('Directory upload failed:', error)
  }
}
```

### JSON Upload

Upload JSON objects directly to IPFS:

```typescript
import { uploadJson } from '@buildeross/ipfs-service'

async function handleJsonUpload() {
  const metadata = {
    name: "My NFT",
    description: "A cool NFT",
    image: "ipfs://...",
    attributes: [
      { trait_type: "Color", value: "Blue" }
    ]
  }

  try {
    const result = await uploadJson(metadata)
    console.log('JSON CID:', result.cid)
    console.log('JSON URI:', result.uri)
  } catch (error) {
    console.error('JSON upload failed:', error)
  }
}
```

### Gateway URLs

Generate fetchable URLs from IPFS URIs with gateway fallbacks:

```typescript
import { getFetchableUrls, ipfsGatewayUrls } from '@buildeross/ipfs-service'

// Get fetchable URLs with fallbacks
const urls = getFetchableUrls('ipfs://QmHash...')
// Returns array of gateway URLs:
// [
//   'https://nouns-builder.mypinata.cloud/ipfs/QmHash...',
//   'https://ipfs.io/ipfs/QmHash...',
//   'https://dweb.link/ipfs/QmHash...',
//   ...
// ]

// Get only IPFS gateway URLs
const gatewayUrls = ipfsGatewayUrls('ipfs://QmHash...')
```

### URL Normalization

Parse and normalize various IPFS URL formats:

```typescript
import { normalizeIPFSUrl, isCID, isIPFSUrl } from '@buildeross/ipfs-service'

// Normalize different IPFS URL formats
normalizeIPFSUrl('QmHash...') // 'ipfs://QmHash...'
normalizeIPFSUrl('https://ipfs.io/ipfs/QmHash...') // 'ipfs://QmHash...'
normalizeIPFSUrl('ipfs://QmHash...') // 'ipfs://QmHash...'

// Check if string is a valid CID
isCID('QmHash...') // true
isCID('bafy...') // true
isCID('invalid') // false

// Check if URL is IPFS-related
isIPFSUrl('ipfs://QmHash...') // true
isIPFSUrl('https://ipfs.io/ipfs/QmHash...') // true
isIPFSUrl('https://example.com') // false
```

## Upload Types and Limits

The service supports different upload types with specific file size limits and MIME type restrictions:

### File Types

```typescript
// General files (10MB limit)
await uploadFile(file, { type: 'file' })

// Images only (1MB limit)
await uploadFile(imageFile, { type: 'image' })

// Media files (50MB limit)
await uploadFile(videoFile, { type: 'media' })

// Directories (200MB total limit)
await uploadDirectory(files)

// JSON objects (10KB limit)
await uploadJson(jsonData)
```

### Supported MIME Types

#### Images
- `image/jpeg`, `image/png`, `image/gif`
- `image/webp`, `image/svg+xml`

#### Videos
- `video/mp4`, `video/webm`, `video/quicktime`

#### Audio
- `audio/mpeg`, `audio/ogg`, `audio/wav`

#### Documents
- `application/pdf`, `application/json`, `text/plain`

## Caching

The service includes intelligent caching to prevent duplicate uploads:

```typescript
// File content is hashed and cached locally
const result1 = await uploadFile(file, { cache: true })
const result2 = await uploadFile(file, { cache: true }) // Returns cached result

// Disable caching if needed
const result = await uploadFile(file, { cache: false })
```

## Error Handling

The service provides detailed error messages for common scenarios:

```typescript
import { uploadFile, formatFileSize } from '@buildeross/ipfs-service'

try {
  await uploadFile(file, { type: 'image' })
} catch (error) {
  if (error.message.includes('File size exceeds limit')) {
    console.error('File too large:', formatFileSize(file.size))
  } else if (error.message.includes('Upload failed')) {
    console.error('Network or service error')
  } else {
    console.error('Unknown error:', error)
  }
}
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run linting
pnpm lint
```

### Scripts

- `pnpm test` - Run test suite with Vitest
- `pnpm lint` - Run ESLint

## Dependencies

### Runtime Dependencies
- `@brokerloop/ttlcache` - TTL caching functionality
- `ipfs-core-types` - IPFS core type definitions
- `ipfs-http-client` - IPFS HTTP client
- `it-last` - Iterator utilities
- `multiformats` - Multiformat utilities for CID parsing
- `sha.js` - SHA hashing for file deduplication
- `url-join` - URL joining utilities

### Development Dependencies
- `vitest` - Testing framework
- TypeScript and ESLint configurations

## API Endpoints

The service expects these API endpoints to be available in your Next.js application:

### `/api/upload-url`
- **Method**: POST
- **Body**: `{ type: UploadType }`
- **Response**: `{ url: string }` - Signed upload URL

### `/api/pin-cid` 
- **Method**: POST
- **Body**: `{ cid: string }`
- **Response**: Success confirmation

### `/api/pin-json`
- **Method**: POST  
- **Body**: JSON object to pin
- **Response**: `{ cid: string }`

## Gateway Configuration

The service uses multiple IPFS gateways for redundancy:

1. **Primary**: Pinata gateway (configurable)
2. **Fallbacks**: IPFS.io, dweb.link, w3s.link, and others

Configure the primary gateway via environment variables:
```bash
NEXT_PUBLIC_PINATA_GATEWAY=your-gateway.mypinata.cloud
BASE_URL=https://your-domain.com
```

## File Size Limits

| Upload Type | Size Limit | Description |
|-------------|------------|-------------|
| `file` | 10MB | General files with broad MIME type support |
| `image` | 1MB | Image files only |
| `media` | 50MB | Images, videos, and audio files |
| `directory` | 200MB | Total size across all files |
| `json` | 10KB | JSON objects |

## Type Definitions

```typescript
export type IPFSUploadResponse = {
  cid: string
  uri: string // ipfs://...
}

export type ProgressCallback = (progress: number) => void

export type UploadType = 'file' | 'image' | 'media' | 'directory' | 'json'

export type FileEntry = File | {
  content: File
  path: string
}

export type IPFSUrl = `ipfs://${string}`
```

## License

MIT License - see LICENSE file for details.
