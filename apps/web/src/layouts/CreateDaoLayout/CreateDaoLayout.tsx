import { Uploading } from '@buildeross/ui/Uploading'
import { Box } from '@buildeross/zord'
import React, { ReactElement, ReactNode } from 'react'
import { useFormStore } from 'src/modules/create-dao'

import { BaseLayout } from '../BaseLayout'
import { LayoutWrapper } from '../LayoutWrapper'
import { Nav } from './Nav'

function CreateDaoLayout({ children }: { children: ReactNode }) {
  const isUploadingToIPFS = useFormStore((x) => x.isUploadingToIPFS)
  const ipfsUploadProgress = useFormStore((x) => x.ipfsUploadProgress)

  return (
    <BaseLayout contentPadding={{ '@initial': 'x0' }} nav={<Nav />}>
      <Box>{children}</Box>
      <Uploading
        isUploadingToIPFS={isUploadingToIPFS}
        ipfsUploadProgress={ipfsUploadProgress}
      />
    </BaseLayout>
  )
}

export function getCreateDaoLayout(page: ReactElement) {
  return (
    <LayoutWrapper>
      <CreateDaoLayout>{page}</CreateDaoLayout>
    </LayoutWrapper>
  )
}
