import { Box, Flex } from '@buildeross/zord'
import React from 'react'

import { useFormStore } from '../../stores'
import { CreateFormSection } from '../../types'
import {
  circleVariant,
  flowSectionWrapperVariants,
  flowTitleVariant,
} from './NavSection.css'

export const NavSection: React.FC<{
  sections: CreateFormSection[]
  section: CreateFormSection
}> = ({ sections, section }) => {
  const { fulfilledSections, activeSection, setActiveSection, setUpArtwork } =
    useFormStore()

  const isActive = sections[activeSection]?.title === section.title
  const isFulfilled = fulfilledSections.includes(section.title)
  const isLast = sections.indexOf(section) === sections.length - 1
  const isPreviewMode = activeSection === 4 && !!setUpArtwork.artwork.length

  const getCircleType = () => {
    if (isPreviewMode) return isActive ? 'previewActive' : 'preview'
    if (isActive) return isLast ? 'flowCircleActiveLast' : 'flowCircleActive'
    if (isFulfilled) return isLast ? 'flowFulfilledCircleLast' : 'flowFulfilledCircle'
    return isLast ? 'flowCircleLast' : 'flowCircle'
  }

  const getTitleType = () => {
    if (isPreviewMode) return isActive ? 'previewActive' : 'preview'
    if (isFulfilled) return 'fulfilled'
    return isActive ? 'active' : 'default'
  }

  const circleType = getCircleType()
  const titleType = getTitleType()

  return (
    <Flex
      direction="row"
      key={section.title}
      className={flowSectionWrapperVariants[isPreviewMode ? 'preview' : 'default']}
      onClick={() => {
        if (isFulfilled) {
          setActiveSection(sections.indexOf(section))
        }
      }}
    >
      <Flex direction="column" align="center">
        <Flex
          align="center"
          justify="center"
          className={circleVariant[circleType]}
          height="x4"
          width="x4"
        >
          {isFulfilled}
        </Flex>
        <Box className={flowTitleVariant[titleType]}>{section.title}</Box>
      </Flex>
    </Flex>
  )
}
