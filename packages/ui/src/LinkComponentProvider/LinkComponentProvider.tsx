import {
  ComponentType,
  createContext,
  CSSProperties,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
  useContext,
} from 'react'

export type BaseLinkProps = {
  href: string
  children?: ReactNode
  className?: string
  style?: CSSProperties
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
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

export const LinkComponentProvider = ({
  children,
  LinkComponent,
}: LinkComponentProviderProps) => {
  return <LinkContext.Provider value={{ LinkComponent }}>{children}</LinkContext.Provider>
}

const DefaultLink = ({ href, children, ...props }: BaseLinkProps) => (
  <a href={href} {...props}>
    {children}
  </a>
)

export const useLinkComponent = (): LinkComponent => {
  const context = useContext(LinkContext)
  return context?.LinkComponent ?? DefaultLink
}
