import { atoms, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React, { ReactElement } from 'react'

import { accordionItem, accordionName } from './Accordion.css'

export const AccordionItem: React.FC<{
  title: string | ReactElement
  description: ReactElement
  summary?: string | ReactElement
  defaultOpen?: boolean
  titleFontSize?: number
  summaryFontSize?: number
  mb?: any
}> = ({
  title,
  description,
  summary,
  defaultOpen = false,
  titleFontSize = 28,
  summaryFontSize = 14,
  mb = 'x4',
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(defaultOpen)
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
      px={'x6'}
      mb={mb}
      borderColor={'border'}
      borderStyle={'solid'}
      borderRadius={'curved'}
      borderWidth={'thin'}
      className={accordionItem}
    >
      <Flex
        onClick={() => setIsOpen((bool) => !bool)}
        pb={'x6'}
        pt={'x6'}
        align={'center'}
        justify={'space-between'}
        gap={'x4'}
        className={accordionName}
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
        {(isOpen && <Icon id="chevronUp" cursor={'pointer'} />) || (
          <Icon id="chevronDown" cursor={'pointer'} />
        )}
      </Flex>
      <motion.div
        variants={variants}
        initial={'initial'}
        animate={isOpen ? 'animate' : 'initial'}
        className={atoms({
          height: 'x0',
          overflow: 'hidden',
        })}
      >
        <Text variant={'paragraph-md'}>{description}</Text>
      </motion.div>
    </Stack>
  )
}
