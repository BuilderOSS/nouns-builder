import { ArtworkError } from '@buildeross/types'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
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
} from '../styles'

interface ArtworkUploadProps {
  id: string
  inputLabel: string | ReactElement
  helperText?: string
  formError?: any
  fileCount: number | string
  traitCount: number
  onUpload: (e: BaseSyntheticEvent) => void
  artworkError: ArtworkError | undefined
  uploadError: string | undefined
  fileType?: string
  layerOrdering: React.ReactNode
  onReset?: () => void
}

export const ArtworkUpload: React.FC<ArtworkUploadProps> = ({
  id,
  inputLabel,
  helperText,
  formError,
  fileCount,
  traitCount,
  onUpload,
  artworkError: artworkError,
  uploadError: uploadError,
  fileType,
  layerOrdering,
  onReset,
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
      <div className={defaultInputLabelStyle}>{inputLabel}</div>
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
      <div className={formError ? dropAreaErrorStyle : dropAreaStyle}>
        <Box
          as={'label'}
          h={'x16'}
          w={'100%'}
          px={'x8'}
          htmlFor={id}
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
          id={id}
          name="file"
          type="file"
          multiple={true}
          ref={dropInput}
          onChange={onUpload}
        />
      </div>
      <Flex justify={'space-between'} direction="row" py={'x4'}>
        {(artworkError || uploadError) && (
          <Box className={uploadErrorBox}>
            {uploadError && <Box>{uploadError}</Box>}

            <Box as={'ul'} m={'x0'}>
              {artworkError?.maxTraits && <li>{artworkError.maxTraits}</li>}
              {artworkError?.mime && <li>{artworkError.mime}</li>}
              {artworkError?.directory && <li>{artworkError.directory}</li>}
              {artworkError?.dimensions && <li>{artworkError.dimensions}</li>}
            </Box>
          </Box>
        )}
        {!artworkError && !uploadError && traitCount > 0 && !!fileType && (
          <Box fontSize={12} className={uploadSuccessBox}>
            <Box as={'ul'} m={'x0'}>
              <li>
                {traitCount > 1 ? `${traitCount} traits` : `${traitCount} trait`} &#9733;
              </li>
              <li>supported file type: {fileType} &#9733;</li>
              <li>correct folder structure &#9733;</li>
            </Box>
          </Box>
        )}
        {onReset && (fileCount || traitCount > 0) ? (
          <Button type="button" variant={'secondary'} onClick={onReset}>
            Reset artwork
          </Button>
        ) : null}
      </Flex>

      {!artworkError && !uploadError && fileCount && traitCount > 0 && layerOrdering}
    </Box>
  )
}
