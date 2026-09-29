import { Flex } from '@buildeross/zord'

import { plainToggleButton, toggleContainer } from './Toggle.css'

interface ToggleProps {
  on: boolean
  onToggle: () => void
  ariaLabel?: string
  id?: string
}

export const Toggle = ({ on, onToggle, ariaLabel, id }: ToggleProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Space and Enter keys for keyboard activation
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onToggle()
    }
  }

  return (
    <Flex
      className={toggleContainer[on ? 'on' : 'off']}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      id={id}
      tabIndex={0}
      style={{ cursor: 'pointer' }}
    >
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
}
