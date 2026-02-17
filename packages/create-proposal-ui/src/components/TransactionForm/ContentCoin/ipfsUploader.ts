import { uploadFile } from '@buildeross/ipfs-service'
import type { Uploader, UploadResult } from '@zoralabs/coins-sdk'

/**
 * Custom IPFS uploader that wraps uploadFile from ipfs-service
 * and implements the Uploader interface from @zoralabs/coins-sdk
 */
export class IPFSUploader implements Uploader {
  async upload(file: File): Promise<UploadResult> {
    const result = await uploadFile(file)

    return {
      url: result.uri as `ipfs://${string}`,
      size: file.size,
      mimeType: file.type || undefined,
    }
  }
}
