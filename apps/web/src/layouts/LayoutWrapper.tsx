import { isBlocked } from '@buildeross/blocklist'
import { Box, Stack } from '@buildeross/zord'
import React, { ReactNode } from 'react'
import { Skull } from 'src/components/Skull'
import { useAccount } from 'wagmi'

import { DefaultLayout } from './DefaultLayout'

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const { address } = useAccount()

  if (isBlocked(address))
    return (
      <DefaultLayout>
        <Stack align={'center'} py={'x32'}>
          <Skull />
          <Box>Access Denied</Box>
        </Stack>
      </DefaultLayout>
    )

  return <>{children}</>
}
