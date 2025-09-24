import { atoms, Flex, Icon } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React, { ReactNode } from 'react'
import {
  reviewSectionStyleVariants,
  reviewSectionSubHeading,
} from 'src/styles/deploy.css'

export const ReviewSection: React.FC<{
  subHeading: string
  children: ReactNode[]
}> = ({ subHeading, children }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const variants = {
    initial: {
      height: 0,
      paddingBottom: 0,
    },
    open: {
      height: 'auto',
      paddingBottom: 20,
    },
  }

  return (
    <Flex
      direction={'column'}
      align={'start'}
      width={'100%'}
      borderRadius={'curved'}
      mb={'x4'}
      borderWidth={'thin'}
      borderColor={'primary'}
      className={reviewSectionStyleVariants[isOpen ? 'open' : 'default']}
      onClick={() => setIsOpen((bool) => !bool)}
    >
      <Flex
        align={'center'}
        justify={'center'}
        className={reviewSectionSubHeading}
        px={'x6'}
        py={'x4'}
      >
        {subHeading}
        <Flex align={'center'} justify={'center'} ml={'auto'}>
          {(!isOpen && <Icon id="chevronDown" />) || <Icon id="chevronUp" />}
        </Flex>
      </Flex>

      <motion.div
        className={atoms({
          display: 'flex',
          overflow: 'hidden',
          height: 'x0',
          width: '100%',
        })}
        variants={variants}
        initial={'initial'}
        animate={!isOpen ? 'initial' : 'open'}
      >
        <Flex direction={'column'} width={'100%'} px={'x6'} py={'x4'}>
          {children}
        </Flex>
      </motion.div>
    </Flex>
  )
}
