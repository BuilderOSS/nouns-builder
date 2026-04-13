import { useChainStore } from '@buildeross/stores'
import { Box } from '@buildeross/zord'
import React from 'react'

import {
  centeredImage,
  centeredImageWrap,
  container,
  page,
  section,
} from './AboutPage.css'
import { AboutFinalCta } from './components/AboutFinalCta'
import { AboutHero } from './components/AboutHero'
import { CoiningHighlightsSection } from './components/CoiningHighlightsSection'
import { DroposalHighlightsSection } from './components/DroposalHighlightsSection'
import { FeaturedDaoSection } from './components/FeaturedDaoSection'
import { ProposalHighlightsSection } from './components/ProposalHighlightsSection'
import { SectionIntro } from './components/SectionIntro'
import { WhatIsBuilderSection } from './components/WhatIsBuilderSection'
import { WhatYouCanBuildSection } from './components/WhatYouCanBuildSection'
import { WhyBuilderSection } from './components/WhyBuilderSection'
import { heroHighlights } from './data'
import { useAboutDaoTabs } from './useAboutDaoTabs'
import { useAboutShowcase } from './useAboutShowcase'
import { useAboutSnapshotStats } from './useAboutSnapshotStats'

export const AboutPageView: React.FC = () => {
  const chain = useChainStore((x) => x.chain)
  const { data: tabsData, isLoading } = useAboutDaoTabs(chain.slug)
  const { data: snapshotData } = useAboutSnapshotStats()
  const { data: showcaseData } = useAboutShowcase()
  const heroLogos = React.useMemo(() => {
    if (!tabsData) return []

    const seen = new Set<string>()

    return Object.values(tabsData)
      .flat()
      .filter((dao) => dao.recentAuctionImage)
      .filter((dao) => {
        if (!dao.recentAuctionImage || seen.has(dao.recentAuctionImage)) return false
        seen.add(dao.recentAuctionImage)
        return true
      })
      .slice(0, 12)
      .map((dao) => ({
        id: dao.id,
        name: dao.name,
        imageUrl: dao.recentAuctionImage as string,
      }))
  }, [tabsData])

  return (
    <Box className={page}>
      <Box className={container}>
        <AboutHero heroHighlights={heroHighlights} heroLogos={heroLogos} />

        <Box className={section}>
          <WhatIsBuilderSection />
        </Box>

        <Box className={section}>
          <FeaturedDaoSection
            isLoading={isLoading}
            stats={snapshotData?.stats}
            tabsData={tabsData}
          />
        </Box>

        <Box className={section}>
          <WhyBuilderSection />
        </Box>

        <Box className={section}>
          <ProposalHighlightsSection items={showcaseData?.proposals} />
        </Box>

        <Box className={section}>
          <CoiningHighlightsSection items={showcaseData?.coining} />
        </Box>

        <Box className={section}>
          <DroposalHighlightsSection items={showcaseData?.drops} />
        </Box>

        <Box className={section}>
          <WhatYouCanBuildSection />
        </Box>

        <Box className={section}>
          <SectionIntro
            eyebrowText="Governance"
            title="All made possible thanks to Builder DAO"
          />
          <Box
            as="p"
            style={{
              maxWidth: '720px',
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#5C5648',
            }}
          >
            This public good tooling and the Nouns Builder Protocol are maintained and
            governed by{' '}
            <Box
              as="a"
              href="https://nouns.build/dao/base/0xe8af882f2f5c79580230710ac0e2344070099432"
              rel="noreferrer"
              target="_blank"
              style={{ color: '#2563EB', textDecoration: 'underline' }}
            >
              Builder DAO
            </Box>
            . Learn more about the DAO&apos;s vision and mission{' '}
            <Box
              as="a"
              href="https://nouns.build/dao/ethereum/0xdf9b7d26c8fc806b1ae6273684556761ff02d422/vote/66"
              rel="noreferrer"
              target="_blank"
              style={{ color: '#2563EB', textDecoration: 'underline' }}
            >
              here
            </Box>
            .
          </Box>
          <Box className={section}>
            <Box className={centeredImageWrap}>
              <Box
                as="a"
                href="https://nouns.build/dao/base/0xe8af882f2f5c79580230710ac0e2344070099432"
                rel="noreferrer"
                target="_blank"
              >
                <Box
                  as="img"
                  alt="Builder DAO logo"
                  className={centeredImage}
                  src="/builderlogo.png"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className={section}>
          <AboutFinalCta />
        </Box>
      </Box>
    </Box>
  )
}
