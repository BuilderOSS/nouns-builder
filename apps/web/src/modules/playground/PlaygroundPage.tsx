import { Box } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import type { DaoListItem } from 'src/modules/dashboard/SingleDaoSelector'
import { useAccount } from 'wagmi'

import { CustomArtworkUpload } from './components/CustomArtworkUpload'
import { DaoSelector } from './components/DaoSelector'
import { PlaygroundContent } from './components/PlaygroundContent'
import { PlaygroundHeader } from './components/PlaygroundHeader'
import { PlaygroundLanding } from './components/PlaygroundLanding'

export type PlaygroundView = 'landing' | 'dao' | 'custom'

export const PlaygroundPage: React.FC = () => {
  const { address } = useAccount()
  const [view, setView] = useState<PlaygroundView>('landing')
  const [selectedDao, setSelectedDao] = useState<DaoListItem | undefined>()

  const handleSelectDaoArtwork = useCallback(() => {
    setView('dao')
    setSelectedDao(undefined)
  }, [])

  const handleSelectCustomUpload = useCallback(() => {
    setView('custom')
  }, [])

  const handleBackToLanding = useCallback(() => {
    setView('landing')
    setSelectedDao(undefined)
  }, [])

  const handleToggleView = useCallback(() => {
    setView((_view) => (_view === 'dao' ? 'custom' : 'dao'))
  }, [])

  // Landing page with two cards
  if (view === 'landing') {
    return (
      <Box w="100%">
        <PlaygroundLanding
          onSelectDaoArtwork={handleSelectDaoArtwork}
          onSelectCustomUpload={handleSelectCustomUpload}
        />
      </Box>
    )
  }

  const isCustomView = view === 'custom'

  return (
    <Box w="100%">
      <PlaygroundHeader
        dao={selectedDao}
        view={view}
        onBack={handleBackToLanding}
        onToggleView={handleToggleView}
      />
      {isCustomView ? (
        <CustomArtworkUpload />
      ) : selectedDao ? (
        <PlaygroundContent dao={selectedDao} />
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
