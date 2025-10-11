import { ReactNode } from 'react'
import { BaseLinkProps, useLinkComponent } from 'src/components/LinkComponentProvider'

export const OptionalLink: React.FC<
  { enabled: boolean; children: ReactNode } & BaseLinkProps
> = ({ enabled, children, ...linkProps }) => {
  const Link = useLinkComponent()

  if (enabled) {
    return <Link {...linkProps}>{children}</Link>
  } else {
    return <>{children}</>
  }
}
