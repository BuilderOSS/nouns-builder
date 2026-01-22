export interface VideoPreviewProps {
  src: string
  width?: string | number
  height?: string | number
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  src,
  width = 400,
  height = 400,
}) => {
  return (
    <video
      src={src}
      autoPlay
      loop
      muted={true}
      playsInline
      style={{
        objectFit: 'cover',
        borderRadius: '10px',
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    />
  )
}
