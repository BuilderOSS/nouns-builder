import { Box, Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'

import {
  hiddenDaoDisclosure,
  hiddenDaoDisclosureChevron,
  hiddenDaoDisclosureChevronClosed,
  hiddenDaoDisclosureChevronOpen,
  hiddenDaoDisclosureContent,
  hiddenDaoDisclosureTrigger,
} from './HiddenDaoDisclosure.css'

type HiddenDaoDisclosureProps = {
  children: React.ReactNode
  count: number
  isOpen: boolean
  onToggle: () => void
}

export const HiddenDaoDisclosure: React.FC<HiddenDaoDisclosureProps> = ({
  children,
  count,
  isOpen,
  onToggle,
}) => {
  const panelId = React.useId()

  return (
    <Box className={hiddenDaoDisclosure}>
      <Box
        as="button"
        type="button"
        className={hiddenDaoDisclosureTrigger}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <Flex
          align="center"
          justify="center"
          className={[
            hiddenDaoDisclosureChevron,
            isOpen ? hiddenDaoDisclosureChevronOpen : hiddenDaoDisclosureChevronClosed,
          ]}
        >
          <Icon id="chevron-down" size="sm" />
        </Flex>
        <Text fontWeight="display">{`Hidden DAOs (${count})`}</Text>
      </Box>
      {isOpen ? (
        <Box id={panelId} className={hiddenDaoDisclosureContent}>
          {children}
        </Box>
      ) : null}
    </Box>
  )
}
