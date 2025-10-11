import {
  type BaseLinkProps,
  useLinkComponent,
} from '@buildeross/ui/LinkComponentProvider'
import { ReactNode } from 'react'

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
