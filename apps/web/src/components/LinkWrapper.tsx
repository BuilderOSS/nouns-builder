import React from 'react'
import { useLinkComponent } from 'src/components/LinkComponentProvider'

export type LinkWrapperOptions =
  | { href: string; onClick?: never }
  | { onClick: () => void; href?: never }

export type LinkWrapperProps = {
  link?: LinkWrapperOptions
  children: React.ReactNode
}

export const LinkWrapper: React.FC<LinkWrapperProps> = ({ link, children }) => {
  const Link = useLinkComponent()
  if (!link) {
    // No link provided → just render plain content
    return <>{children}</>
  }

  if (!!link.href) {
    // Link navigation
    return (
      <Link href={link.href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {children}
      </Link>
    )
  }

  if (!!link.onClick) {
    // Action navigation
    return (
      <button
        onClick={link.onClick}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'inherit',
          textAlign: 'inherit',
          font: 'inherit',
        }}
      >
        {children}
      </button>
    )
  }

  return <>{children}</>
}
