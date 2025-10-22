import { BASE_URL, isPlatform } from '@buildeross/constants'
import {
  ComponentType,
  createContext,
  CSSProperties,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
  useContext,
  useMemo,
} from 'react'

export type BaseLinkProps = {
  href: string
  children?: ReactNode
  className?: string
  style?: CSSProperties
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
  // Optional scroll prop — only used when supported by the LinkComponent
  scroll?: boolean
}

type LinkComponent =
  | ComponentType<BaseLinkProps>
  | ForwardRefExoticComponent<BaseLinkProps & RefAttributes<HTMLAnchorElement>>

interface LinkContextType {
  LinkComponent: LinkComponent
}

const LinkContext = createContext<LinkContextType | undefined>(undefined)

interface LinkComponentProviderProps {
  children: ReactNode
  LinkComponent: LinkComponent
}

/**
 * Provider for custom link components (e.g., Next.js Link).
 */
export const LinkComponentProvider = ({
  children,
  LinkComponent,
}: LinkComponentProviderProps) => {
  return <LinkContext.Provider value={{ LinkComponent }}>{children}</LinkContext.Provider>
}

/**
 * Default fallback: plain <a> link.
 * Ignores scroll prop.
 */
const DefaultLink = ({ href: hrefProp, children, ...props }: BaseLinkProps) => {
  const href = useMemo(() => {
    if (!hrefProp || !hrefProp.startsWith('/') || isPlatform) return hrefProp
    return `${BASE_URL}${hrefProp}`
  }, [hrefProp])

  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

/**
 * Hook that returns the appropriate Link component.
 */
export const useLinkComponent = (): LinkComponent => {
  const context = useContext(LinkContext)
  return context?.LinkComponent ?? DefaultLink
}
