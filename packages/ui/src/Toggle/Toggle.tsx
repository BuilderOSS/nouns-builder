import { Flex } from '@buildeross/zord'

import { plainToggleButton, toggleContainer } from './Toggle.css'

interface ToggleProps {
  on: boolean
  onToggle: () => void
}

export const Toggle = ({ on, onToggle }: ToggleProps) => (
  <Flex className={toggleContainer[on ? 'on' : 'off']} onClick={onToggle}>
    <Flex
      h={'x6'}
      w={'x6'}
      borderRadius={'round'}
      className={plainToggleButton}
      align={'center'}
      justify={'center'}
    />
  </Flex>
)
