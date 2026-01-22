export interface ImagePreviewProps {
  src: string
  alt?: string
  width?: string | number
  height?: string | number
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = 'Preview',
  width = 400,
  height = 400,
}) => {
  return (
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      style={{
        objectFit: 'cover',
        borderRadius: '10px',
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    />
  )
}
