import { Uploading } from '@buildeross/ui'
import { Box } from '@buildeross/zord'
import React, { ReactElement, ReactNode } from 'react'
import { useFormStore } from 'src/modules/create-dao'

import { LayoutWrapper } from '../LayoutWrapper'
import { Nav } from './Nav'

function CreateDaoLayout({ children }: { children: ReactNode }) {
  const isUploadingToIPFS = useFormStore((x) => x.isUploadingToIPFS)
  const ipfsUploadProgress = useFormStore((x) => x.ipfsUploadProgress)
  return (
    <Box>
      <Nav />
      <Box px={'x0'}>{children}</Box>
      <Uploading
        isUploadingToIPFS={isUploadingToIPFS}
        ipfsUploadProgress={ipfsUploadProgress}
      />
    </Box>
  )
}

export function getCreateDaoLayout(page: ReactElement) {
  return (
    <LayoutWrapper>
      <CreateDaoLayout>{page}</CreateDaoLayout>
    </LayoutWrapper>
  )
}
