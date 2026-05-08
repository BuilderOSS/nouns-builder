import { mapDaoLinkKeyToIcon, toDisplayDaoLinks } from '@buildeross/utils'
import { Button, Flex, Icon, IconType } from '@buildeross/zord'
import React from 'react'

import { iconAnchor } from '../../styles/About.css'

interface IconAnchor {
  href: string
  name: IconType
  label?: string
}

const IconAnchor: React.FC<IconAnchor> = ({ href, name, label }) => {
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
      title={label || href}
      aria-label={label || href}
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
  links?: Record<string, string>
}

export const ExternalLinks: React.FC<ExternalLinksProps> = ({ links }) => {
  const normalizedLinks = React.useMemo(() => {
    return toDisplayDaoLinks(links || {})
  }, [links])

  return (
    <Flex direction={{ '@initial': 'column', '@768': 'row' }} justify="center">
      {normalizedLinks.length ? (
        <Flex mr={{ '@initial': 'x0', '@768': 'x2' }}>
          {normalizedLinks.map(({ key, href }) => (
            <IconAnchor
              href={href}
              name={mapDaoLinkKeyToIcon(key) as IconType}
              label={key}
              key={`${key}-${href}`}
            />
          ))}
        </Flex>
      ) : null}
    </Flex>
  )
}
