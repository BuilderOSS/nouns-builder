import { Flex, Icon } from '@buildeross/zord'

import {
  allocationToggle,
  allocationToggleButtonVariants,
  plainToggleButton,
} from './Toggle.css'

interface ToggleProps {
  on: boolean
  onToggle: () => void
  variant?: 'default' | 'plain'
}

export const Toggle = ({ on, onToggle, variant = 'default' }: ToggleProps) => (
  <Flex className={allocationToggle[on ? 'on' : 'off']} onClick={onToggle}>
    <Flex
      h={'x6'}
      w={'x6'}
      borderRadius={'round'}
      className={
        variant === 'plain'
          ? plainToggleButton
          : allocationToggleButtonVariants[on ? 'on' : 'off']
      }
      align={'center'}
      justify={'center'}
    >
      {variant === 'default' && <Icon id={'handlebarCircle'} />}
    </Flex>
  </Flex>
)
