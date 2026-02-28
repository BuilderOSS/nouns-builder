export type IPFSUploadResponse = {
  cid: string
  uri: string
}

export type IPFSUpload = {
  name: string
  webkitRelativePath: string
  ipfs: IPFSUploadResponse
  trait: string
  type?: string
  content?: File
}

export type ArtworkError = {
  maxTraits?: string
  mime?: string
  directory?: string
  dimensions?: string
}

export type ImageProps = {
  name: string
  trait: string
  uri: string
  content?: File
}

export type Trait = {
  trait: string
  properties: string[]
}

export type OrderedTraits = Array<Trait>

export type SelectedTraitsProps = {
  picker: string
  trait: string
  uri: string
  content?: File
}

export type ImagesByTraitProps = {
  trait: string
  images: ImageProps[]
}

export type Item = {
  name: string
  uri: string
}

export type Property = {
  name: string
  items: Item[]
}
