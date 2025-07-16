import { Flex } from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect } from 'react'

import { Icon } from 'src/components/Icon'
import { usePrevious } from 'src/hooks'
import {
  adminStickySaveButton,
  adminStickySaveWrapper,
  confirmFormWrapper,
} from 'src/styles/Admin.css'
import {
  deployCheckboxHelperText,
  deployCheckboxStyleVariants,
} from 'src/styles/deploy.css'

import { ContractButton } from '../ContractButton'

interface StickySaveProps {
  confirmText: string
  disabled: boolean
  saveButtonText: string
  isSubmitting: boolean
  onSave: () => void
}

const confirmAnimation = {
  initial: {
    height: 0,
  },
  animate: {
    height: 'auto',
  },
}

const StickySave: React.FC<StickySaveProps> = ({
  confirmText,
  saveButtonText,
  disabled,
  isSubmitting,
  onSave,
}) => {
  const [hasConfirmed, setHasConfirmed] = React.useState<boolean>(false)
  const [showConfirmBanner, setShowConfirmBanner] = React.useState<boolean>(false)
  const previousSubmitting = usePrevious(isSubmitting)

  useEffect(() => {
    // Once form has finished submitting we want to clear the state
    if (previousSubmitting === true && isSubmitting === false) {
      setShowConfirmBanner(false)
      setHasConfirmed(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting])

  const handleConfirm = () => {
    if (hasConfirmed) {
      setShowConfirmBanner(false)
    }
    setHasConfirmed(!hasConfirmed)
  }

  const handleSave = () => {
    if (!hasConfirmed) {
      setShowConfirmBanner(true)
    } else {
      onSave()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 'auto' }}
        exit={{ height: 0 }}
      >
        <Flex
          direction={'column'}
          position={'fixed'}
          align={'center'}
          justify={'center'}
          bottom={'x0'}
          left={'x0'}
          width={'100%'}
          className={adminStickySaveWrapper}
        >
          <motion.div
            variants={confirmAnimation}
            initial={'initial'}
            animate={showConfirmBanner ? 'animate' : 'initial'}
          >
            <Flex direction={'column'} py={'x8'} px={'x4'} className={confirmFormWrapper}>
              <Flex align={'center'} justify={'center'} gap={'x4'}>
                <Flex
                  align={'center'}
                  justify={'center'}
                  className={
                    deployCheckboxStyleVariants[hasConfirmed ? 'confirmed' : 'default']
                  }
                  onClick={handleConfirm}
                >
                  {hasConfirmed && <Icon id="check" fill="background1" />}
                </Flex>
                <Flex className={deployCheckboxHelperText}>{confirmText}</Flex>
              </Flex>
            </Flex>
          </motion.div>
          <Flex
            backgroundColor="background1"
            width={'100%'}
            direction={'column'}
            align={'center'}
          >
            <ContractButton
              className={adminStickySaveButton}
              type={'submit'}
              my={'x3'}
              loading={isSubmitting}
              disabled={disabled || isSubmitting}
              handleClick={handleSave}
            >
              {hasConfirmed ? 'Confirm' : saveButtonText}
            </ContractButton>
          </Flex>
        </Flex>
      </motion.div>
    </AnimatePresence>
  )
}

export default StickySave
