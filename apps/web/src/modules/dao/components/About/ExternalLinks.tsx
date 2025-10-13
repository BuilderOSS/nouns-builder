import { Button, Flex, Icon, IconType } from '@buildeross/zord'
import React from 'react'

import { iconAnchor } from '../../styles/About.css'

interface IconAnchor {
  href: string
  name: IconType
}

const IconAnchor: React.FC<IconAnchor> = ({ href, name }) => {
  return (
    <Button
      variant="circleSolid"
      backgroundColor="background2"
      as="a"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      w="x10"
      className={iconAnchor}
    >
      <Flex
        backgroundColor="background2"
        align="center"
        justify="center"
        borderRadius="phat"
        w="x10"
        h="x10"
      >
        <Icon id={name} />
      </Flex>
    </Button>
  )
}

interface ExternalLinksProps {
  address?: string
  links?: {
    website?: string
    discord?: string
    twitter?: string
  }
}

export const ExternalLinks: React.FC<ExternalLinksProps> = ({ links }) => {
  return (
    <Flex direction={{ '@initial': 'column', '@768': 'row' }} justify="center">
      {links ? (
        <Flex mr={{ '@initial': 'x0', '@768': 'x2' }}>
          {links?.twitter ? <IconAnchor href={links?.twitter} name="twitter" /> : null}
          {links?.discord ? <IconAnchor href={links?.discord} name="discord" /> : null}
          {links?.website ? <IconAnchor href={links?.website} name="globe" /> : null}
        </Flex>
      ) : null}
    </Flex>
  )
}
