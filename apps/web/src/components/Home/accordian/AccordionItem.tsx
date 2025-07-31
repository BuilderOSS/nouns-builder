import { atoms, Flex, Stack, Text } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React, { ReactElement } from 'react'
import { Icon } from 'src/components/Icon'

import { accordionItem, accordionName } from '../../../styles/home.css'

const AccordionItem: React.FC<{
  title: string | ReactElement
  description: ReactElement
}> = ({ title, description }) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false)
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
      mb={'x4'}
      borderColor={'border'}
      borderStyle={'solid'}
      borderRadius={'curved'}
      borderWidth={'thin'}
      className={accordionItem}
    >
      <Flex
        onClick={() => setIsOpen((bool) => !bool)}
        fontSize={28}
        fontWeight={'label'}
        pb={'x6'}
        pt={'x6'}
        align={'center'}
        justify={'space-between'}
        className={accordionName}
      >
        {title}
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

export default AccordionItem
