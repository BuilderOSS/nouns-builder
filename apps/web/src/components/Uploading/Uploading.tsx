import { Box, Flex } from '@buildeross/zord'
import React from 'react'
import { Spinner } from 'src/components/Spinner'

import { uploadNotificationWrapper } from './Uploading.css'

export const Uploading = ({
  isUploadingToIPFS,
  ipfsUploadProgress,
}: {
  isUploadingToIPFS: boolean
  ipfsUploadProgress: number
}) => {
  return (
    <>
      {isUploadingToIPFS && (
        <Flex
          position={'fixed'}
          pl={'x8'}
          pt={'x4'}
          bottom={'x5'}
          width={'100%'}
          className={uploadNotificationWrapper}
          align={'flex-end'}
          justify={'flex-end'}
          right={'x8'}
          style={{ zIndex: 100 }}
        >
          <Flex align={'center'} justify={'center'}>
            {ipfsUploadProgress === 0 ? (
              <Box fontSize={14}>Uploading Artwork to IPFS</Box>
            ) : (
              <Box fontSize={14}>Uploading Artwork to IPFS: {ipfsUploadProgress}%</Box>
            )}

            <Spinner mx={'x4'} />
          </Flex>
        </Flex>
      )}
    </>
  )
}

export default Uploading
