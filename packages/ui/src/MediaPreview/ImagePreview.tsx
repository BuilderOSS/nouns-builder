export interface ImagePreviewProps {
  src: string
  alt?: string
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt = 'Preview' }) => {
  return (
    <img
      src={src}
      width={400}
      height={400}
      alt={alt}
      style={{
        objectFit: 'cover',
        borderRadius: '10px',
        height: '400px',
        width: '400px',
      }}
    />
  )
}
