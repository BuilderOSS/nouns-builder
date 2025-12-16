import { Box, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

import {
  card,
  cardDescription,
  cardIcon,
  cardsContainer,
  cardTitle,
  landingContainer,
  landingDescription,
  landingTitle,
} from './PlaygroundLanding.css'

interface PlaygroundLandingProps {
  onSelectDaoArtwork: () => void
  onSelectCustomUpload: () => void
}

export const PlaygroundLanding: React.FC<PlaygroundLandingProps> = ({
  onSelectDaoArtwork,
  onSelectCustomUpload,
}) => {
  return (
    <Box className={landingContainer}>
      <Stack align="center" gap="x4">
        <Text className={landingTitle}>Artwork Playground</Text>
        <Text className={landingDescription}>
          Preview and experiment with NFT artwork. Choose to browse existing DAO
          collections or upload your own custom artwork.
        </Text>
      </Stack>

      <Flex className={cardsContainer}>
        <Box
          as="button"
          className={card}
          onClick={onSelectDaoArtwork}
          aria-label="Browse DAO Artwork"
        >
          <Icon id="brush" className={cardIcon} />
          <Text className={cardTitle}>Browse DAO Artwork</Text>
          <Text className={cardDescription}>
            Explore and preview artwork from existing DAOs. Experiment with different
            trait combinations.
          </Text>
        </Box>

        <Box
          as="button"
          className={card}
          onClick={onSelectCustomUpload}
          aria-label="Upload Custom Artwork"
        >
          <Icon id="plus" className={cardIcon} />
          <Text className={cardTitle}>Upload Custom Artwork</Text>
          <Text className={cardDescription}>
            Upload your own artwork folder to preview and generate trait combinations for
            your collection.
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}
