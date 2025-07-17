import {
  IPFSUploadResponse,
  getFetchableUrls,
  uploadDirectory,
} from '@buildeross/ipfs-service'
import { sanitizeFileName } from '@buildeross/utils/sanitize'
import React from 'react'

export interface ArtworkType {
  trait: string
  properties: string[]
}

export interface IPFSUpload {
  name: string
  webkitRelativePath: string
  ipfs: IPFSUploadResponse | null
  trait: string
  type?: string
  content?: File
  blob?: Blob | string
}

export interface ImageProps {
  cid?: string
  name: string
  trait: string
  uri: string
  url: string
  path?: string
  content?: File
  blob?: Blob | string
}

export interface ArtworkUploadError {
  maxTraits?: string
  mime?: string
  directory?: string
  dimensions?: string
}

export interface UseArtworkUploadProps {
  artwork: ArtworkType[]
  ipfsUpload: IPFSUpload[]
  isUploadingToIPFS: boolean
  onUploadStart: () => void
  onUploadSuccess: (ipfs: IPFSUpload[]) => void
  onUploadError: (error: Error) => void
}

export const useArtworkUpload = ({
  artwork,
  ipfsUpload,
  isUploadingToIPFS,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
}: UseArtworkUploadProps) => {
  const [uploadArtworkError, setUploadArtworkError] = React.useState<
    ArtworkUploadError | undefined
  >()
  const [ipfsUploadError, setIpfsUploadError] = React.useState<boolean>(false)

  /*   assign ipfs upload to property  */
  const images = React.useMemo(() => {
    if (isUploadingToIPFS) return

    if (Array.isArray(ipfsUpload) && artwork.length) {
      return ipfsUpload.reduce((acc: ImageProps[] = [], upload) => {
        const index = artwork?.map((e: any) => e.trait).indexOf(upload.trait)
        const childIndex = artwork[index]?.properties.indexOf(upload.name)
        const childName = artwork[index]?.properties[childIndex]
        const fetchableUrl = getFetchableUrls(upload?.ipfs?.uri)?.[0] ?? ''

        acc.push({
          trait: artwork[index]?.trait,
          name: childName,
          cid: upload?.ipfs?.cid || '',
          uri: upload?.ipfs?.uri || '',
          url: encodeURI(
            fetchableUrl +
              `/${sanitizeFileName(
                upload.webkitRelativePath.split('/').slice(1).join('/')
              )}` || ''
          ),
          path: upload.webkitRelativePath,
          content: upload?.content,
          blob: upload?.blob,
        })
        return acc
      }, [])
    }

    return []
  }, [artwork, ipfsUpload, isUploadingToIPFS])

  /* prepare files */

  const [isProcessing, setIsProcessing] = React.useState<boolean | undefined>(undefined)
  const [files, setFiles] = React.useState<FileList | null>(null)
  const [filesArray, setFilesArray] = React.useState<File[] | null>(null)
  const fileInfo = React.useMemo(() => {
    if (!files) return

    setIsProcessing(true)
    const filesArray = Array.from(files).filter((file) => file.name !== '.DS_Store')
    const acceptableMIME = ['image/png', 'image/svg+xml']

    let collectionName: string = ''
    let fileType: string = ''
    let traits: {
      trait: string
      properties: string[]
    }[] = []

    const reduced = filesArray.reduce((acc: any = [], cv, index) => {
      const paths = cv.webkitRelativePath.split('/')
      const collection = paths[0]
      const currentTrait = sanitizeFileName(paths[1])
      const currentProperty = sanitizeFileName(paths[2])

      /*  set collection name and file type */
      if (!collectionName) {
        collectionName = paths[0]
      }

      if (!fileType) {
        fileType = cv.type
      }

      /*  construct traits and properties  */
      if (traits.filter((trait) => trait.trait === currentTrait).length === 0) {
        traits.push({ trait: currentTrait, properties: [] })
      }

      if (!!traits) {
        traits
          .filter((trait) => trait.trait === currentTrait)[0]
          ?.properties?.push(currentProperty)
      }

      /* handle errors */

      // forward slashes seem to be converted to `:`
      // check for both folder and file name
      if (
        cv.name.includes(':') ||
        paths[2]?.includes(':') ||
        cv.name.split('.').length !== 2 ||
        paths[1].split('.').length !== 1
      ) {
        setUploadArtworkError({
          directory: `file or folder naming incorrect. must not include forward slashes or periods.`,
        })
        return
      }

      if (paths.length !== 3 || !paths) {
        if (paths.length > 3) {
          setUploadArtworkError({
            directory: `file or folder naming incorrect. must not include back slashes.`,
          })
          return
        }

        setUploadArtworkError({
          directory: `folder structure is incorrect. download the nouns example folder to compare.`,
        })
        return
      }

      if (cv.type.length && !acceptableMIME.includes(cv.type)) {
        setUploadArtworkError({
          mime: `${cv.type} is an unsupported file type - file: ${cv.name}`,
        })
        return
      }

      if (traits.length > 10) {
        setUploadArtworkError({
          maxTraits: `Maximum of 10 traits per collection. Your upload includes ${traits.length} traits.`,
        })
        return
      }

      if (filesArray[index - 1 > 0 ? index - 1 : 0].type !== cv.type) {
        setUploadArtworkError({
          mime: `All file types must be the same.`,
        })
        return
      }

      /* get image size */
      const fr = new FileReader()
      fr.readAsDataURL(cv)
      const getImageSize = (fr: FileReader, count: number) => {
        let img = new Image()
        img.src = fr.result?.toString() || ''
        img.onload = function () {
          let height = img.height
          let width = img.width
          let min = 600

          if ((height < min || width < min) && cv.type !== 'image/svg+xml') {
            setUploadArtworkError({
              dimensions: `we recommend images of min, 600px width x height, your images are width: ${width} x ${height} px`,
            })
            return
          }

          if (height !== width) {
            setUploadArtworkError({
              dimensions: `images must be of equal height and width, your images are width: ${width} x ${height} px`,
            })
            return
          }

          if (count === filesArray?.length - 1) {
            setIsProcessing(false)
          }
        }
      }
      fr.onload = () => getImageSize(fr, filesArray.indexOf(cv))

      acc.push({
        collection,
        trait: currentTrait,
        traitProperty: currentProperty,
        file: cv,
      })

      return acc
    }, [])

    return {
      filesLength: files.length,
      fileType,
      collectionName,
      traits,
      fileArray: reduced,
    }
  }, [files])

  React.useEffect(() => {
    if (isProcessing === false) {
      const filesArray = fileInfo?.fileArray.reduce((acc: any[], cv: { file: File }) => {
        acc.push(cv.file)

        return acc
      }, [])

      setFilesArray(filesArray)
    }
  }, [isProcessing, fileInfo])

  /* upload Files to ipfs via zora ipfs service */

  const uploadToIPFS: (files: File[]) => Promise<IPFSUpload[]> = async (files) => {
    const ipfsUploadResponse = await uploadDirectory(
      files.map((file) => ({
        content: file,
        path: sanitizeFileName(file.webkitRelativePath.split('/').slice(1).join('/')),
      })),
      { cache: false }
    )

    return files.map((file) => ({
      name: sanitizeFileName(file.webkitRelativePath.split('/')[2]),
      property: file.webkitRelativePath.split('/')[2],
      collection: file.webkitRelativePath.split('/')[0],
      trait: sanitizeFileName(file.webkitRelativePath.split('/')[1]),
      path: file.webkitRelativePath,
      content: file,
      blob: URL.createObjectURL(file),
      webkitRelativePath: file.webkitRelativePath,
      type: file.type,
      ipfs: ipfsUploadResponse,
    }))
  }

  React.useEffect(() => {
    if (!filesArray || !!uploadArtworkError) return

    const handleUpload = async (filesArray: File[]) => {
      const files = filesArray.filter((file) => file.name !== '.DS_Store')

      try {
        onUploadStart()
        const ipfs = await uploadToIPFS(files)
        // eslint-disable-next-line no-console
        console.debug('Uploaded to IPFS', ipfs)
        onUploadSuccess(ipfs)
      } catch (err) {
        setIpfsUploadError(true)
        console.error('Error uploading to IPFS', err)
        onUploadError(err as Error)
        return
      }
    }

    handleUpload(filesArray)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesArray, uploadArtworkError])

  return {
    images,
    setFiles,
    fileInfo,
    filesArray,
    uploadArtworkError,
    setUploadArtworkError,
    ipfsUploadError,
  }
}
