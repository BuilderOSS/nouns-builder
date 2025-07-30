import { Box } from '@buildeross/zord'
import React, { ReactElement, ReactNode } from 'react'
import { Uploading } from 'src/components/Uploading'
import { useFormStore } from 'src/modules/create-dao'

import { LayoutWrapper } from '../LayoutWrapper'
import { Nav } from './Nav'

function CreateDaoLayout({ children }: { children: ReactNode }) {
  const isUploadingToIPFS = useFormStore((x) => x.isUploadingToIPFS)
  return (
    <Box>
      <Nav />
      <Box px={'x0'}>{children}</Box>
      <Uploading isUploadingToIPFS={isUploadingToIPFS} />
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
