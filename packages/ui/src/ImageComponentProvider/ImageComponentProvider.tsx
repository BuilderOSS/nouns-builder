import {
  ComponentType,
  createContext,
  ForwardRefExoticComponent,
  JSX,
  ReactNode,
  RefAttributes,
  useContext,
} from 'react'

export type BaseImageProps = Omit<
  JSX.IntrinsicElements['img'],
  'src' | 'srcSet' | 'ref' | 'alt' | 'width' | 'height'
> & {
  src: string
  alt: string
  width?: number | `${number}`
  height?: number | `${number}`
}

type ImageComponent =
  | ComponentType<BaseImageProps>
  | ForwardRefExoticComponent<BaseImageProps & RefAttributes<HTMLImageElement>>

interface ImageContextType {
  ImageComponent: ImageComponent
}

const ImageContext = createContext<ImageContextType | undefined>(undefined)

interface ImageComponentProviderProps {
  children: ReactNode
  ImageComponent: ImageComponent
}

export const ImageComponentProvider = ({
  children,
  ImageComponent,
}: ImageComponentProviderProps) => {
  return (
    <ImageContext.Provider value={{ ImageComponent }}>{children}</ImageContext.Provider>
  )
}

const DefaultImage = ({ src, alt, ...props }: BaseImageProps) => (
  <img src={src} alt={alt} {...props} />
)

export const useImageComponent = (): ImageComponent => {
  const context = useContext(ImageContext)
  return context?.ImageComponent ?? DefaultImage
}
