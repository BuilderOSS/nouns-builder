import { Box, Flex } from '@buildeross/zord'
import React from 'react'

import {
  contentWrapper,
  customSpinner,
  percentageText,
  progressText,
  progressUnderline,
  spinnerContainer,
  uploadNotificationWrapper,
} from './Uploading.css'

export const Uploading = ({
  isUploadingToIPFS,
  ipfsUploadProgress,
}: {
  isUploadingToIPFS: boolean
  ipfsUploadProgress: number
}) => {
  const shouldShow = isUploadingToIPFS
  const progress = Math.floor(ipfsUploadProgress)

  return (
    <>
      {shouldShow && (
        <Flex
          position={'fixed'}
          pl={'x8'}
          pt={'x4'}
          bottom={'x5'}
          width={'100%'}
          align={'flex-end'}
          justify={'flex-end'}
          right={'x8'}
          style={{ zIndex: 100 }}
        >
          <Flex align={'center'} justify={'center'} className={uploadNotificationWrapper}>
            <Box className={progressUnderline} style={{ width: `${progress}%` }} />
            <Flex align={'center'} justify={'center'} className={contentWrapper}>
              <Box fontSize={14} className={progressText}>
                Uploading Artwork to IPFS
              </Box>

              <Box mx={'x4'} className={spinnerContainer}>
                <Box className={customSpinner} />
                <Box className={percentageText}>{progress}</Box>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  )
}

export default Uploading
