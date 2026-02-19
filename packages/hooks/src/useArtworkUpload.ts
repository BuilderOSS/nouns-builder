import { uploadDirectory } from '@buildeross/ipfs-service/upload'
import { ArtworkError, IPFSUpload, IPFSUploadResponse, Trait } from '@buildeross/types'
import { sanitizeFileName } from '@buildeross/utils/sanitize'
import React from 'react'

export interface UseArtworkUploadProps {
  onUploadStart: () => void
  onUploadSuccess: (ipfs: IPFSUpload[]) => void
  onUploadError: (error: Error) => void
  onUploadProgress: (progress: number) => void
}

type UploadArtworkStatus =
  | 'idle'
  | 'processing'
  | 'processed'
  | 'uploading'
  | 'ready'
  | 'error'

const ACCEPTABLE_MIME = ['image/png', 'image/svg+xml'] as const
const MIN_IMAGE_DIMENSION_PX = 600
const MAX_TRAITS = 10

const isAcceptableMime = (t: string): t is (typeof ACCEPTABLE_MIME)[number] =>
  (ACCEPTABLE_MIME as readonly string[]).includes(t)

function hasInvalidNameOrStructure(file: File, paths: string[]): boolean {
  // forward slashes sometimes converted to `:`
  // also disallow extra periods in filenames and trait folder names
  return (
    file.name.includes(':') ||
    paths[2]?.includes(':') ||
    file.name.split('.').length !== 2 ||
    paths[1].split('.').length !== 1
  )
}

async function validateSquareMinSize(
  file: File,
  minPx: number
): Promise<{ ok: true } | { ok: false; error: ArtworkError }> {
  if (file.type === 'image/svg+xml') {
    // SVG: scalable — skip all dimension checks
    return { ok: true }
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = () => reject(new Error('Failed to read file'))
    fr.onload = () => resolve(fr.result?.toString() || '')
    fr.readAsDataURL(file)
  })

  const { width, height } = await new Promise<{ width: number; height: number }>(
    (resolve, reject) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.src = dataUrl
    }
  )

  if (width !== height) {
    return {
      ok: false,
      error: {
        dimensions: `images must be of equal height and width, your images are width: ${width} x ${height} px`,
      },
    }
  }

  // Raster images (PNG)
  if (width < minPx || height < minPx) {
    return {
      ok: false,
      error: {
        dimensions: `images must be at least ${minPx}×${minPx}px; yours are ${width}×${height}px`,
      },
    }
  }

  return { ok: true }
}

type ArtworkItem = {
  collection: string
  trait: string
  traitProperty: string
  file: File
}

type ProcessedArtworkInfo = {
  filesLength: number
  fileType: string
  collectionName: string
  traits: Trait[]
  artworkItems: ArtworkItem[]
}

export type UploadedArtworkItem = ArtworkItem & {
  ipfs: IPFSUploadResponse
}

export type UploadedArtwork = Omit<ProcessedArtworkInfo, 'artworkItems'> & {
  items: UploadedArtworkItem[]
  // optional convenience helpers
  ipfs: IPFSUploadResponse
  itemsByPath: Record<string, UploadedArtworkItem>
}

export interface UseArtworkUploadReturn {
  artwork: UploadedArtwork | undefined
  setFiles: (files: FileList | undefined) => void
  artworkError: ArtworkError | undefined
  uploadError: string | undefined
  status: UploadArtworkStatus
}

export const useArtworkUpload = ({
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  onUploadProgress,
}: UseArtworkUploadProps): UseArtworkUploadReturn => {
  const [artworkError, setArtworkError] = React.useState<ArtworkError | undefined>(
    undefined
  )
  const [uploadError, setUploadError] = React.useState<string | undefined>(undefined)

  const [status, setStatus] = React.useState<UploadArtworkStatus>('idle')
  const [inputFiles, setInputFiles] = React.useState<FileList | undefined>(undefined)

  // "prepared" info (pre-upload)
  const [processedArtworkInfo, setProcessedArtworkInfo] = React.useState<
    ProcessedArtworkInfo | undefined
  >(undefined)

  // final enriched artifact (post-upload)
  const [artwork, setArtwork] = React.useState<UploadedArtwork | undefined>(undefined)

  // Guards against “old processing finishes after new files were selected”
  const processRunIdRef = React.useRef(0)

  /**
   * Process & validate input files
   * - no side-effects in useMemo
   * - async dimension checks are awaited (no race)
   * - runId guard prevents stale commits
   */
  React.useEffect(() => {
    const runId = ++processRunIdRef.current
    // Invalidate any in-flight upload so it discards its result
    ++uploadRunIdRef.current

    const commitIfLatest = (fn: () => void) => {
      if (runId !== processRunIdRef.current) return
      fn()
    }

    const fail = (error: ArtworkError) => {
      commitIfLatest(() => {
        setArtworkError(error)
        setStatus('error')
      })
    }

    const run = async () => {
      // Reset derived state when files change
      commitIfLatest(() => {
        setArtwork(undefined)
        setProcessedArtworkInfo(undefined)
        setUploadError(undefined)
        setArtworkError(undefined)
      })

      if (!inputFiles) {
        commitIfLatest(() => setStatus('idle'))
        return
      }

      commitIfLatest(() => setStatus('processing'))

      const filesArray = Array.from(inputFiles).filter((f) => f.name !== '.DS_Store')

      if (!filesArray.length) {
        commitIfLatest(() => setStatus('idle'))
        return
      }

      let collectionName = ''
      let fileType = ''

      // traitsMap: trait -> properties[]
      const traitsMap = new Map<string, string[]>()

      const artworkItems: ArtworkItem[] = []

      // Validate synchronously first (fast fail)
      for (let index = 0; index < filesArray.length; index++) {
        const file = filesArray[index]!
        const paths = file.webkitRelativePath.split('/')

        if (paths.length !== 3) {
          fail({
            directory:
              paths && paths.length > 3
                ? `file or folder naming incorrect. must not include back slashes.`
                : `folder structure is incorrect. download the demo folder to compare.`,
          })
          return
        }

        const [collectionRaw, traitRaw, propertyRaw] = paths

        const collection = collectionRaw
        const currentTrait = sanitizeFileName(traitRaw)
        const currentProperty = sanitizeFileName(propertyRaw)

        if (!collectionName) collectionName = collectionRaw
        if (!fileType) fileType = file.type

        if (hasInvalidNameOrStructure(file, paths)) {
          fail({
            directory: `file or folder naming incorrect. must not include forward slashes or periods.`,
          })
          return
        }

        if (!isAcceptableMime(file.type)) {
          fail({
            mime: `${file.type} is an unsupported file type - file: ${file.name}`,
          })
          return
        }

        // enforce consistent mime across all files
        if (fileType && file.type !== fileType) {
          fail({
            mime: `All file types must be the same.`,
          })
          return
        }

        if (!traitsMap.has(currentTrait)) traitsMap.set(currentTrait, [])
        traitsMap.get(currentTrait)!.push(currentProperty)

        if (traitsMap.size > MAX_TRAITS) {
          fail({
            maxTraits: `Maximum of 10 traits per collection. Your upload includes ${traitsMap.size} traits.`,
          })
          return
        }

        artworkItems.push({
          collection,
          trait: currentTrait,
          traitProperty: currentProperty,
          file,
        })
      }

      // Async validations (dimensions) — awaited to avoid race
      try {
        const dimensionResults = await Promise.all(
          filesArray.map((file) => validateSquareMinSize(file, MIN_IMAGE_DIMENSION_PX))
        )

        if (runId !== processRunIdRef.current) return

        const firstFailure = dimensionResults.find((r) => r.ok === false)
        if (firstFailure && !firstFailure.ok) {
          fail(firstFailure.error)
          return
        }
      } catch (err) {
        if (runId !== processRunIdRef.current) return
        fail({
          dimensions: `Unable to validate image dimensions for one or more files.`,
        })
        return
      }

      // Build traits array for return type
      const traits = Array.from(traitsMap.entries())
        .map(([trait, properties]) => ({
          trait,
          properties,
        }))
        .sort((a, b) => b.trait.localeCompare(a.trait))

      const processed: ProcessedArtworkInfo = {
        filesLength: artworkItems.length,
        fileType,
        collectionName,
        traits,
        artworkItems: artworkItems,
      }

      commitIfLatest(() => {
        setProcessedArtworkInfo(processed)
        setStatus('processed')
      })
    }

    run()
  }, [inputFiles])

  /* upload Files to ipfs via ipfs service */
  const uploadToIPFS: (files: File[]) => Promise<IPFSUpload[]> = React.useCallback(
    async (files: File[]) => {
      const ipfsUploadResponse = (await uploadDirectory(
        files.map((file) => ({
          content: file,
          path: sanitizeFileName(file.webkitRelativePath.split('/').slice(1).join('/')),
        })),
        { cache: true, onProgress: onUploadProgress }
      )) as IPFSUploadResponse

      const results: IPFSUpload[] = files.map((file) => ({
        name: sanitizeFileName(file.webkitRelativePath.split('/')[2]),
        property: file.webkitRelativePath.split('/')[2],
        collection: file.webkitRelativePath.split('/')[0],
        trait: sanitizeFileName(file.webkitRelativePath.split('/')[1]),
        path: file.webkitRelativePath,
        content: file,
        webkitRelativePath: file.webkitRelativePath,
        type: file.type,
        ipfs: ipfsUploadResponse,
      }))

      return results
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const uploadRunIdRef = React.useRef(0)

  React.useEffect(() => {
    if (status !== 'processed' || !processedArtworkInfo || !!artworkError) return
    const uploadId = ++uploadRunIdRef.current

    const handleUpload = async () => {
      const preparedItems = processedArtworkInfo.artworkItems
      const files = preparedItems.map(({ file }) => file)

      try {
        setStatus('uploading')
        setUploadError(undefined)

        onUploadStart()

        const ipfsUploads = await uploadToIPFS(files)

        // discard if a newer upload has started
        if (uploadId !== uploadRunIdRef.current) return
        // eslint-disable-next-line no-console
        console.debug('Uploaded to IPFS', ipfsUploads)

        if (!ipfsUploads.length) {
          throw new Error('No files uploaded')
        }

        // Enrich each prepared item with IPFS response
        // NOTE: uploadDirectory returns one response for the directory; it's the same for every file
        const directoryIpfs = ipfsUploads[0].ipfs as IPFSUploadResponse

        const uploadedArtworkItems: UploadedArtworkItem[] = preparedItems.map((item) => ({
          ...item,
          ipfs: directoryIpfs,
        }))

        const uploadedArtwork: UploadedArtwork = {
          filesLength: processedArtworkInfo.filesLength,
          fileType: processedArtworkInfo.fileType,
          collectionName: processedArtworkInfo.collectionName,
          traits: processedArtworkInfo.traits,
          items: uploadedArtworkItems,
          ipfs: directoryIpfs,
          itemsByPath: Object.fromEntries(
            uploadedArtworkItems.map((it) => [it.file.webkitRelativePath, it])
          ),
        }

        setArtwork(uploadedArtwork)

        // Keep external callback unchanged (still provides IPFSUpload[])
        onUploadSuccess(ipfsUploads)

        setStatus('ready')
      } catch (err: unknown) {
        if (uploadId !== uploadRunIdRef.current) return
        setUploadError((err as Error).message)
        console.error('Error uploading to IPFS', err)
        onUploadError(err as Error)
        setStatus('error')
      }
    }

    handleUpload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, processedArtworkInfo, artworkError, uploadToIPFS])

  const hasError = Boolean(uploadError || artworkError)

  return {
    setFiles: setInputFiles,
    artwork: hasError || status !== 'ready' ? undefined : artwork,
    artworkError,
    uploadError,
    status,
  }
}
