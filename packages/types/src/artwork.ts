export type IPFSUploadResponse = {
  cid: string
  uri: string
}

export type ArtworkType = {
  trait: string
  properties: string[]
}

export type IPFSUpload = {
  name: string
  webkitRelativePath: string
  ipfs: IPFSUploadResponse | null
  trait: string
  type?: string
  content?: File
  blob?: Blob | string
}

export type ImageProps = {
  cid?: string
  name: string
  trait: string
  uri: string
  url: string
  path?: string
  content?: File
  blob?: Blob | string
}

export type ArtworkUploadError = {
  maxTraits?: string
  mime?: string
  directory?: string
  dimensions?: string
}

export type Trait = {
  trait: string
  properties: string[]
  ipfs?: {}[]
}

export type FileInfo = {
  filesLength: number
  fileType: string
  collectionName: string
  traits: Trait[]
  fileArray: File[]
}

export type OrderedTraits = Array<Trait>

export type SelectedTraitsProps = {
  picker: string
  trait: string
  uri: string
  url: string
  content?: File
}

export type ImagesByTraitProps = {
  trait: string
  images: ImageProps[]
}
