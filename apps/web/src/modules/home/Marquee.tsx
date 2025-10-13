import { atoms, Flex } from '@buildeross/zord'
import { motion } from 'framer-motion'
import Image from 'next/image'
import React from 'react'

import {
  BlueSun,
  BlueWheel,
  Collective,
  Creation,
  GreenClover,
  NounsGlasses,
  Of,
  Possibilities,
  PurpleGalaxy,
  PurpleStar,
  The,
  Unlock,
} from './Marquee.css'

export const Marquee = () => {
  return (
    <Flex direction={'column'} align={'center'} mt={{ '@initial': 'x4', '@768': 'x32' }}>
      <Flex gap={'x2'} mb={'x1'}>
        <Image src={'/home/unlock.svg'} alt={'unlock'} className={Unlock} />
        <motion.div
          className={atoms({ display: 'flex', alignItems: 'center' })}
          animate={{ rotate: 360 }}
          transition={{ ease: 'linear', duration: 2, repeat: Infinity }}
        >
          <Image
            src={'/home/purple_galaxy.svg'}
            alt={'purple galaxy icon'}
            className={PurpleGalaxy}
          />
        </motion.div>
      </Flex>
      <Flex gap={'x2'} mb={'x1'}>
        <Image src={'/home/the.svg'} alt={'the'} className={The} />
        <motion.div
          className={atoms({ display: 'flex', alignItems: 'center' })}
          animate={{ rotate: [36, 72, 108, 144, 180, 216, 252, 288, 324, 396] }}
          transition={{
            duration: 20,
            ease: [0.36, 0, 0.66, -0.56],
            repeat: Infinity,
          }}
        >
          <Image src={'/home/blue_wheel.svg'} alt={'blue wheel'} className={BlueWheel} />
        </motion.div>
        <Image
          src={'/home/possibilities.svg'}
          alt={'possibilities'}
          className={Possibilities}
        />
      </Flex>
      <Flex gap={'x2'} mb={'x1'}>
        <Image src={'/home/of.svg'} alt={'of'} className={Of} />
        <motion.div
          className={atoms({ display: 'flex', alignItems: 'center' })}
          animate={{ rotate: -360 }}
          transition={{
            duration: 6,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          <Image
            src={'/home/green_clover.svg'}
            alt={'green clover icon'}
            className={GreenClover}
          />
        </motion.div>
        <Image src={'/home/collective.svg'} alt={'collective'} className={Collective} />

        <Flex
          ml={{ '@initial': 'x4', '@768': 'x12' }}
          position={'relative'}
          align={'center'}
          justify={'center'}
        >
          <motion.div
            className={atoms({
              display: 'flex',
              alignItems: 'center',
              position: 'absolute',
            })}
            style={{
              opacity: 0,
            }}
            animate={{
              opacity: [0, 1, 0],
              filter: ['blur(20px)', 'blur(0px)', 'blur(20px)'],
              rotate: [0, 180, 360],
              scale: [0.6, 1, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Image
              src={'/home/purple_star.svg'}
              alt={'purple star icon'}
              className={PurpleStar}
            />
          </motion.div>
          <motion.div
            className={atoms({
              display: 'flex',
              alignItems: 'center',
              position: 'absolute',
            })}
            style={{
              transform: 'scale(0.6)',
              opacity: 0,
            }}
            animate={{
              opacity: [0, 1, 0],
              filter: ['blur(0px)', 'blur(0px)', 'blur(0px)'],
              rotate: [0, 180, 360],
              scale: [0.6, 1, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <Image src={'/home/blue_sun.svg'} alt={'blue sun icon'} className={BlueSun} />
          </motion.div>
        </Flex>
      </Flex>
      <Flex gap={'x2'} mb={'x1'}>
        <Image
          src={'/home/nouns_glasses.svg'}
          alt={'small nouns glasses logo'}
          className={NounsGlasses}
        />
        <Image src={'/home/creation.svg'} alt={'creation'} className={Creation} />
      </Flex>
    </Flex>
  )
}
