import { normalizeIPFSUrl, uploadFile } from '@buildeross/ipfs-service'
import { Box, Flex, Spinner, Stack } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React, { ReactElement, useEffect, useState } from 'react'

import { FallbackImage } from '../FallbackImage'
import {
  defaultUploadStyle,
  singleImageUploadWrapperVariants,
  uploadErrorBox,
} from './SingleImageUpload.css'

export type SingleImageUploadProps = {
  formik: FormikProps<any>
  id: string
  inputLabel: string | ReactElement
  helperText: string | undefined
  value: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  id,
  formik,
  inputLabel,
  helperText,
  value,
  size = 'md',
}) => {
  const acceptableMIME = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']

  const [isMounted, setIsMounted] = useState(false)
  const [uploadArtworkError, setUploadArtworkError] = React.useState<any>()
  const [isUploading, setIsUploading] = React.useState<boolean>(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleFileUpload = React.useCallback(
    async (_input: FileList | null) => {
      if (!_input) return
      const input = _input[0]

      setUploadArtworkError(false)

      if (input?.type?.length && !acceptableMIME.includes(input.type)) {
        setUploadArtworkError({
          message: `Sorry, ${input.type} is an unsupported file type`,
        })
        return
      }

      try {
        setIsUploading(true)

        const { cid } = await uploadFile(_input[0], { cache: true, type: 'image' })

        formik.setFieldValue(id, normalizeIPFSUrl(cid))
        setIsUploading(false)
        setUploadArtworkError(null)
      } catch (err: any) {
        setIsUploading(false)
        setUploadArtworkError({
          ...err,
          message: `Sorry, there was an error with our file uploading service. ${err?.message}`,
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <Flex mb={'x8'}>
      <Stack align={'center'} width={'100%'}>
        <Flex
          as={'label'}
          direction={'column'}
          position={'relative'}
          align={'center'}
          justify={'center'}
          className={singleImageUploadWrapperVariants[size]}
          htmlFor="file-upload"
        >
          {isUploading && <Spinner alignSelf={'center'} m={'x0'} />}

          {!isUploading && isMounted && !!value && (
            <FallbackImage
              src={value}
              alt="Avatar"
              style={{
                objectFit: 'contain',
                width: '100%',
                height: '100%',
              }}
            />
          )}

          {!isUploading && isMounted && !value && (
            <>
              <Flex color="text4" mb={'x2'} style={{ textAlign: 'center' }}>
                {inputLabel}
              </Flex>
              <Flex fontWeight={'display'} style={{ textAlign: 'center' }}>
                {helperText}
              </Flex>
            </>
          )}

          <input
            className={defaultUploadStyle}
            id="file-upload"
            data-testid="file-upload"
            name="file"
            type="file"
            multiple={true}
            onChange={(event) => {
              handleFileUpload(event.currentTarget.files)
            }}
          />
        </Flex>

        {uploadArtworkError && (
          <Box data-testid="error-msg" p={'x4'} fontSize={12} className={uploadErrorBox}>
            <Box as={'ul'} m={'x0'}>
              <li>{uploadArtworkError.message}</li>
            </Box>
          </Box>
        )}
      </Stack>
    </Flex>
  )
}

export default SingleImageUpload
