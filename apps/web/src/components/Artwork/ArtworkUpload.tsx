import { ArtworkUploadError, ImageProps } from '@buildeross/hooks/useArtworkUpload'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React, { BaseSyntheticEvent, ReactElement } from 'react'
import {
  defaultFileDownloadStyle,
  defaultHelperTextStyle,
  defaultInputLabelStyle,
  defaultUploadButtonStyle,
  defaultUploadStyle,
  dropAreaErrorStyle,
  dropAreaStyle,
  noneSelectedStyle,
  uploadErrorBox,
  uploadSuccessBox,
} from 'src/components/Fields/styles.css'
import { Icon } from 'src/components/Icon'

interface ArtworkUploadProps {
  inputLabel: string | ReactElement
  helperText?: string
  errorMessage?: any
  fileCount: number | string
  traitCount: number
  onUpload: (e: BaseSyntheticEvent) => void
  uploadArtworkError: ArtworkUploadError | undefined
  ipfsUploadError: boolean
  images: ImageProps[] | undefined
  fileType?: string
  layerOrdering: React.ReactNode
}

export const ArtworkUpload: React.FC<ArtworkUploadProps> = ({
  inputLabel,
  helperText,
  errorMessage,
  fileCount,
  traitCount,
  onUpload,
  uploadArtworkError,
  ipfsUploadError,
  fileType,
  layerOrdering,
}) => {
  const dropInput = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (dropInput.current !== null) {
      dropInput.current.setAttribute('directory', '')
      dropInput.current.setAttribute('webkitdirectory', '')
    }
  }, [dropInput])

  return (
    <Box mb={'x3'}>
      <label className={defaultInputLabelStyle}>{inputLabel}</label>
      {!!helperText && helperText?.length ? (
        <Stack mb={'x8'}>
          <Text className={defaultHelperTextStyle}>{helperText} </Text>
          <Flex align={'center'}>
            <a href={'/nouns.zip'} download className={defaultFileDownloadStyle}>
              <Icon id="download" mr={'x2'} />
              Download demo folder
            </a>
          </Flex>
        </Stack>
      ) : null}
      <div className={errorMessage ? dropAreaErrorStyle : dropAreaStyle}>
        <Box
          as={'label'}
          h={'x16'}
          w={'100%'}
          px={'x8'}
          htmlFor="file-upload"
          className={defaultUploadButtonStyle}
        >
          <Box as="span">Upload</Box>
          {(fileCount && <Box as="span">{fileCount} Files</Box>) || (
            <Box as="span" className={noneSelectedStyle}>
              None Selected
            </Box>
          )}
        </Box>
        <input
          className={defaultUploadStyle}
          id="file-upload"
          name="file"
          type="file"
          multiple={true}
          ref={dropInput}
          onChange={onUpload}
        />
      </div>
      {((uploadArtworkError || ipfsUploadError) && (
        <Box py={'x4'} className={uploadErrorBox}>
          {ipfsUploadError && (
            <Box>There was an issue uploading your files to ipfs. Please try again.</Box>
          )}

          <Box as={'ul'} m={'x0'}>
            {uploadArtworkError?.maxTraits && <li>{uploadArtworkError.maxTraits}</li>}
            {uploadArtworkError?.mime && <li>{uploadArtworkError.mime}</li>}
            {uploadArtworkError?.directory && <li>{uploadArtworkError.directory}</li>}
            {uploadArtworkError?.dimensions && <li>{uploadArtworkError.dimensions}</li>}
          </Box>
        </Box>
      )) ||
        (traitCount > 0 && (
          <>
            <Box p={'x4'} fontSize={12} className={uploadSuccessBox}>
              <Box as={'ul'} m={'x0'}>
                <li>
                  {traitCount > 1 ? `${traitCount} traits` : `${traitCount} trait`}{' '}
                  &#9733;
                </li>
                <li>supported file type: {fileType} &#9733;</li>
                <li>correct folder structure &#9733;</li>
              </Box>
            </Box>
            {layerOrdering}
          </>
        ))}
    </Box>
  )
}
