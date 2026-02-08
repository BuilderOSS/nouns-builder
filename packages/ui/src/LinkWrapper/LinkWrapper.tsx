import { Flex } from '@buildeross/zord'
import React from 'react'

import { useLinkComponent } from '../LinkComponentProvider'

type FlexProps = React.ComponentProps<typeof Flex>

type LinkWrapperOptions =
  | {
      href: string
      onClick?: never
    }
  | {
      onClick: () => void
      href?: never
    }

export type LinkWrapperProps = FlexProps & {
  link?: LinkWrapperOptions
  enabled?: boolean
  children: React.ReactNode
}

const buttonResetStyles = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'inherit',
  textAlign: 'inherit',
  font: 'inherit',
}

export const LinkWrapper: React.FC<LinkWrapperProps> = ({
  link,
  children,
  style,
  enabled = true,
  ...flexProps
}) => {
  const Link = useLinkComponent()

  if (!link || !enabled) {
    // No link provided or link is disabled
    return (
      <Flex style={style} {...flexProps}>
        {children}
      </Flex>
    )
  }

  if (link.href) {
    // Link navigation
    return (
      <Flex as={Link} href={link.href} style={style} {...flexProps}>
        {children}
      </Flex>
    )
  }

  if (link.onClick) {
    // Action navigation
    return (
      <Flex
        as="button"
        onClick={link.onClick}
        style={{ ...buttonResetStyles, ...style }}
        {...flexProps}
      >
        {children}
      </Flex>
    )
  }

  return (
    <Flex style={style} {...flexProps}>
      {children}
    </Flex>
  )
}
