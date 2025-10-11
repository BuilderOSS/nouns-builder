import { LinkOptions } from '@buildeross/types'
import { Flex } from '@buildeross/zord'
import React from 'react'
import { useLinkComponent } from 'src/components/LinkComponentProvider'

type FlexProps = React.ComponentProps<typeof Flex>

export type LinkWrapperProps = FlexProps & {
  link?: LinkOptions
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
  ...flexProps
}) => {
  const Link = useLinkComponent()

  if (!link) {
    // No link provided → just render Flex with content
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
