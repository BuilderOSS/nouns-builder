import { AnimatedModal } from '@buildeross/ui/Modal'
import { Button, Flex, Icon } from '@buildeross/zord'
import React, { useState } from 'react'

import { useFormStore } from '../../stores'
import { ConfirmReset } from '../ConfirmReset/ConfirmReset'
import { formNavContinueButton, formNavResetButton } from './FormNavButtons.css'

interface FormNavButtonsProps {
  hasPrev?: boolean
  onPrev?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  isSubmit?: boolean
  onNext?: () => void
  children?: React.ReactNode
  showReset?: boolean
  onAfterReset?: () => void
}

export const FormNavButtons: React.FC<FormNavButtonsProps> = ({
  hasPrev = false,
  onPrev,
  nextLabel = 'Continue',
  nextDisabled = false,
  isSubmit = true,
  onNext,
  children,
  showReset = true,
  onAfterReset,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { resetForm } = useFormStore()

  const handleReset = () => {
    resetForm()
    setIsModalOpen(false)
    onAfterReset?.()
  }

  return (
    <>
      {showReset && (
        <AnimatedModal
          open={isModalOpen}
          close={() => setIsModalOpen(false)}
          size="small"
        >
          <ConfirmReset
            handleReset={handleReset}
            onDismiss={() => setIsModalOpen(false)}
          />
        </AnimatedModal>
      )}

      <Flex align={'center'} mt={'x8'}>
        {showReset && (
          <Button
            justify={'center'}
            align={'center'}
            h={'x15'}
            minH={'x15'}
            minW={'x15'}
            variant={'secondary'}
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label="Reset form"
            className={formNavResetButton}
          >
            <Icon id="trash" />
          </Button>
        )}

        {hasPrev && (
          <Button
            justify={'center'}
            align={'center'}
            h={'x15'}
            minH={'x15'}
            minW={'x15'}
            variant={'secondary'}
            type="button"
            onClick={onPrev}
            aria-label="Back"
          >
            <Icon id="arrowLeft" />
          </Button>
        )}

        {children ? (
          children
        ) : (
          <Button
            flex={1}
            h={'x15'}
            minH={'x15'}
            className={formNavContinueButton}
            type={isSubmit ? 'submit' : 'button'}
            disabled={nextDisabled}
            onClick={isSubmit ? undefined : onNext}
            onMouseDown={
              isSubmit
                ? (e: React.MouseEvent<HTMLElement>) => e.preventDefault()
                : undefined
            }
          >
            {nextLabel}
          </Button>
        )}
      </Flex>
    </>
  )
}
