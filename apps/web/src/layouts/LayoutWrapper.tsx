import { isBlocked } from '@buildeross/blocklist'
import { Box, Stack } from '@buildeross/zord'
import React, { ReactNode } from 'react'
import { Skull } from 'src/components/Skull'
import { useLayoutStore } from 'src/stores'
import { useAccount } from 'wagmi'

import { DefaultLayout } from './DefaultLayout'

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const { setIsMobile } = useLayoutStore()
  const { address } = useAccount()

  const handleResize = React.useCallback(() => {
    setIsMobile(window.innerWidth <= 768)
  }, [setIsMobile])

  // add mobile flag to layout store
  React.useEffect(() => {
    if (!!window) {
      window.addEventListener('resize', handleResize)
      handleResize()
    }
  }, [handleResize])

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
