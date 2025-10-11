import { Flex } from '@buildeross/zord'
import React from 'react'
import { useLinkComponent } from 'src/components/LinkComponentProvider'

type FlexProps = React.ComponentProps<typeof Flex>

export type LinkWrapperOptions =
  | { href: string; onClick?: never }
  | { onClick: () => void; href?: never }

export type LinkWrapperProps = FlexProps & {
  link?: LinkWrapperOptions
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
  ...boxProps
}) => {
  const Link = useLinkComponent()

  if (!link) {
    // No link provided → just render Flex with content
    return <Flex {...boxProps}>{children}</Flex>
  }

  if (link.href) {
    // Link navigation
    return (
      <Flex as={Link} href={link.href} {...boxProps}>
        {children}
      </Flex>
    )
  }

  if (link.onClick) {
    // Action navigation
    return (
      <Flex as="button" onClick={link.onClick} style={buttonResetStyles} {...boxProps}>
        {children}
      </Flex>
    )
  }

  return <Flex {...boxProps}>{children}</Flex>
}
