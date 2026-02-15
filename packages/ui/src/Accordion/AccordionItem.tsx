import { atoms, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React, { ReactElement } from 'react'

export const AccordionItem: React.FC<{
  title: string | ReactElement
  description: ReactElement
  summary?: string | ReactElement
  defaultOpen?: boolean
  titleFontSize?: number
  summaryFontSize?: number
  mb?: any
  showWarning?: boolean
  isOpen?: boolean
  onToggle?: () => void
}> = ({
  title,
  description,
  summary,
  defaultOpen = false,
  titleFontSize = 28,
  summaryFontSize = 14,
  mb = 'x4',
  showWarning = false,
  isOpen: controlledIsOpen,
  onToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState<boolean>(defaultOpen)
  const [allowOverflow, setAllowOverflow] = React.useState<boolean>(defaultOpen)

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalIsOpen((bool) => !bool)
    }
    // Immediately disable overflow when closing to prevent content flash
    if (isOpen) {
      setAllowOverflow(false)
    }
  }

  const handleAnimationComplete = () => {
    // Enable overflow after opening animation completes to prevent flash during expansion
    if (isOpen) {
      setAllowOverflow(true)
    }
  }
  const variants = {
    initial: {
      height: 0,
      paddingBottom: 0,
    },
    animate: {
      height: 'auto',
      paddingBottom: 24,
    },
  }

  return (
    <Stack
      mb={mb}
      borderColor={'border'}
      borderStyle={'solid'}
      borderRadius={'curved'}
      borderWidth={'thin'}
      // className={accordionItem}
    >
      <Flex
        onClick={handleToggle}
        pb={'x6'}
        pt={'x6'}
        align={'center'}
        justify={'space-between'}
        gap={'x4'}
        px={'x6'}
        // className={accordionName}
      >
        {summary ? (
          <Stack gap={'x1'} style={{ flex: 1 }}>
            <Text fontSize={titleFontSize} fontWeight={'display'}>
              {title}
            </Text>
            <Text fontSize={summaryFontSize} color={'text3'}>
              {summary}
            </Text>
          </Stack>
        ) : (
          <Text fontSize={titleFontSize} fontWeight={'label'}>
            {title}
          </Text>
        )}
        <Flex align="center" gap="x2">
          {showWarning && <Icon id="warning-16" fill="warning" size="sm" />}
          {(isOpen && <Icon id="chevronUp" cursor={'pointer'} />) || (
            <Icon id="chevronDown" cursor={'pointer'} />
          )}
        </Flex>
      </Flex>
      <motion.div
        variants={variants}
        initial={'initial'}
        animate={isOpen ? 'animate' : 'initial'}
        onAnimationComplete={handleAnimationComplete}
        className={atoms({
          height: 'x0',
          overflow: allowOverflow ? 'visible' : 'hidden',
          paddingLeft: 'x6',
          paddingRight: 'x6',
        })}
        data-accordion-content
      >
        <Text variant={'paragraph-md'}>{description}</Text>
      </motion.div>
    </Stack>
  )
}
