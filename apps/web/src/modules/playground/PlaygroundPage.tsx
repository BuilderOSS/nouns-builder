import { Box } from '@buildeross/zord'
import React, { useState } from 'react'
import type { DaoListItem } from 'src/modules/dashboard/SingleDaoSelector'
import { useAccount } from 'wagmi'

import { DaoSelector } from './components/DaoSelector'
import { PlaygroundContent } from './components/PlaygroundContent'
import { PlaygroundHeader } from './components/PlaygroundHeader'

export const PlaygroundPage: React.FC = () => {
  const { address } = useAccount()
  const [selectedDao, setSelectedDao] = useState<DaoListItem | undefined>()

  const handleChangeDao = () => {
    setSelectedDao(undefined)
  }

  return (
    <Box w="100%">
      {selectedDao ? (
        <>
          <PlaygroundHeader dao={selectedDao} onChangeDao={handleChangeDao} />
          <PlaygroundContent dao={selectedDao} />
        </>
      ) : (
        <DaoSelector
          selectedDao={selectedDao}
          onSelectedDaoChange={setSelectedDao}
          userAddress={address}
        />
      )}
    </Box>
  )
}
