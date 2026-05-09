import { Box, Button, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import {
  aboutCtaButton,
  aboutDarkOnly,
  aboutLightOnly,
  hero,
  heroActions,
  heroCopy,
  heroHighlight,
  heroHighlightDot,
  heroHighlightList,
  heroPanel,
  heroPanelGlow,
  heroText,
  heroTitle,
  heroVennImage,
  heroVennWrap,
  logoMarquee,
  logoMarqueeImage,
  logoMarqueeInner,
  logoMarqueeItem,
  logoMarqueeTrack,
  montageBody,
  montageCard,
  montageFooter,
  montageGrid,
  montagePrimary,
  montageSide,
  montageValue,
} from '../AboutPage.css'

type AboutHeroProps = {
  heroHighlights: string[]
  heroLogos: Array<{
    id: string
    name: string
    imageUrl: string
  }>
}

export const AboutHero: React.FC<AboutHeroProps> = ({ heroHighlights, heroLogos }) => {
  const marqueeLogos = heroLogos.length > 0 ? [...heroLogos, ...heroLogos] : []

  return (
    <Box className={hero}>
      <Box className={heroCopy}>
        <Text as="h1" className={heroTitle}>
          The easiest way to build communities onchain
        </Text>
        <Text className={heroText}>
          Nouns Builder lets anyone launch a DAO where membership, funding, content and
          governance all happen in one fully transparent, onchain system.
        </Text>

        <Box as="ul" className={heroHighlightList}>
          {heroHighlights.map((item) => (
            <Box as="li" className={heroHighlight} key={item}>
              <Box className={heroHighlightDot} />
              <Text>{item}</Text>
            </Box>
          ))}
        </Box>

        <Box className={heroActions}>
          <Button
            as={Link}
            className={aboutCtaButton}
            href="/create"
            pill
            variant="primary"
          >
            Launch a DAO
          </Button>

          <Button
            as={Link}
            className={aboutCtaButton}
            href="/explore"
            pill
            variant="outline"
          >
            Explore existing DAOs
          </Button>
        </Box>
      </Box>

      <Box className={heroPanel}>
        <Box className={heroPanelGlow} />
        <Box className={montageGrid}>
          <Box className={`${montageCard} ${montagePrimary}`}>
            <Text className={montageValue}>{`Launch.\nFund.\nCollaborate.`}</Text>
            <Text className={montageBody}>
              The onchain operating system for decentralized communities.
            </Text>
          </Box>

          <Box className={`${montageCard} ${montageSide}`}>
            <Box className={heroVennWrap}>
              <Box
                as="img"
                alt="Auction, NFT, and DAO relationship diagram"
                className={`${heroVennImage} ${aboutLightOnly}`}
                src="/why.svg"
              />
              <Box
                as="img"
                alt=""
                aria-hidden={true}
                className={`${heroVennImage} ${aboutDarkOnly}`}
                src="/why-dark.svg"
              />
            </Box>
          </Box>

          <Box className={`${montageCard} ${montageFooter}`}>
            <Box className={logoMarquee}>
              <Box className={logoMarqueeTrack}>
                <Box className={logoMarqueeInner}>
                  {marqueeLogos.map((logo, index) => (
                    <Box className={logoMarqueeItem} key={`${logo.id}-${index}`}>
                      <Box
                        as="img"
                        alt={`${logo.name} logo`}
                        className={logoMarqueeImage}
                        src={logo.imageUrl}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
