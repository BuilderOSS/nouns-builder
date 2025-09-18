export interface VideoPreviewProps {
  src: string
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ src }) => {
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
        height: '400px',
        width: '400px',
      }}
    />
  )
}
