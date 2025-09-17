import { useMemo } from 'react'

import { Atoms } from '../atoms'
import { Flex, FlexProps } from '../elements/Flex'
import { icons, IconType } from '../icons'
import { icon } from './Icon.css'

export type IconProps = FlexProps & {
  id: IconType
  fill?: Atoms['color']
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Icon = ({ id, fill, size = 'md', ...props }: IconProps) => {
  const IconSVG = useMemo(() => icons[id], [id])

  return (
    <Flex {...props} color={fill}>
      <IconSVG fill={'currentColor'} className={icon({ size })} />
    </Flex>
  )
}

export { icons }
export type { IconType }
