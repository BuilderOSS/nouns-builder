import {
  normalizeIPFSUrl,
  pinataOptions,
  uploadFile,
  type UploadType,
} from '@buildeross/ipfs-service'
import { Box, Flex, Spinner, Stack, Text } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React, { ReactElement, useEffect, useMemo, useState } from 'react'

import { defaultHelperTextStyle, defaultInputLabelStyle } from '../styles'
import {
  defaultUploadStyle,
  singleMediaUploadWrapper,
  uploadErrorBox,
} from './SingleMediaUpload.css'

export type SingleMediaUploadProps = {
  formik: FormikProps<any>
  id: string
  inputLabel: string | ReactElement
  value: string
  helperText?: string
  onUploadStart?: (value: File) => void
  onUploadSettled?: () => void
  uploadType?: UploadType
}

export const SingleMediaUpload: React.FC<SingleMediaUploadProps> = ({
  id,
  formik,
  inputLabel,
  helperText,
  onUploadStart,
  onUploadSettled,
  value,
  uploadType = 'media',
}) => {
  const [isMounted, setIsMounted] = useState(false)
  const [uploadMediaError, setUploadMediaError] = React.useState<any>()
  const [isUploading, setIsUploading] = React.useState<boolean>(false)
  const [fileName, setFileName] = React.useState<string | undefined>()
  const [progress, setProgress] = React.useState<number>(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const truncate = (value: string) => {
    return value.length > 40 ? `${value.substring(0, 40)}...` : value
  }

  const acceptableMIME = useMemo(
    () => pinataOptions[uploadType].allow_mime_types,
    [uploadType]
  )

  const handleFileUpload = React.useCallback(
    async (_input: FileList | null) => {
      if (!_input) return
      const input = _input[0]

      setUploadMediaError(false)

      if (input?.type?.length && !acceptableMIME.includes(input.type)) {
        setUploadMediaError({
          message: `Sorry, ${input.type} is an unsupported file type`,
        })
        return
      }

      try {
        setIsUploading(true)
        setFileName(input.name)

        onUploadStart?.(input)

        const { cid } = await uploadFile(_input[0], {
          cache: true,
          type: 'media',
          onProgress: setProgress,
        })

        formik.setFieldValue(id, normalizeIPFSUrl(cid))
        setIsUploading(false)
        setUploadMediaError(null)
      } catch (err: any) {
        setIsUploading(false)
        setUploadMediaError({
          ...err,
          message: `Sorry, there was an error with our file uploading service. ${err?.message}`,
        })
      } finally {
        onUploadSettled?.()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, uploadType]
  )

  return (
    <Flex mb={'x8'}>
      <Stack width={'100%'}>
        <label className={defaultInputLabelStyle}>{inputLabel}</label>
        {helperText && !uploadMediaError && (
          <Box className={defaultHelperTextStyle}>{helperText}</Box>
        )}
        <Flex
          as={'label'}
          direction={'column'}
          position={'relative'}
          justify={'center'}
          className={singleMediaUploadWrapper}
          htmlFor={`file-upload-${id}`}
        >
          {!isUploading && isMounted && !value && (
            <Flex mx="x4" align={'center'} justify={'space-between'}>
              <Text fontWeight={'paragraph'} color="text4">
                None selected
              </Text>
              <Text fontWeight={'display'} color="text1">
                Select
              </Text>
            </Flex>
          )}

          {isUploading && fileName && (
            <Flex mx="x4" align={'center'} justify={'space-between'}>
              <Text fontWeight={'paragraph'} color="text1">
                {truncate(fileName)}
              </Text>
              <Flex align={'center'}>
                <Text fontWeight={'paragraph'} color="text3">
                  {`${Math.round(progress)}% uploaded`}
                </Text>
                <Spinner m="x2" />
              </Flex>
            </Flex>
          )}

          {!isUploading && value && (
            <Flex mx="x4" align={'center'} justify={'space-between'}>
              <Text fontWeight={'paragraph'} color="text1">
                {truncate(value)}
              </Text>
              <Text fontWeight={'display'} color="text1">
                Replace
              </Text>
            </Flex>
          )}

          <input
            className={defaultUploadStyle}
            id={`file-upload-${id}`}
            data-testid={`file-upload-${id}`}
            name="file"
            type="file"
            multiple={true}
            onChange={(event) => {
              handleFileUpload(event.currentTarget.files)
            }}
          />
        </Flex>

        {uploadMediaError && (
          <Box data-testid="error-msg" p={'x4'} fontSize={12} className={uploadErrorBox}>
            <Box as={'ul'} m={'x0'}>
              <li>{uploadMediaError.message}</li>
            </Box>
          </Box>
        )}
      </Stack>
    </Flex>
  )
}
