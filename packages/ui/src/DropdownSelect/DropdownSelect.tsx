import { Box, Button, ButtonProps, Flex, Icon, Spinner } from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import React, { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import {
  defaultDropdownSelectOptionStyle,
  defaultFieldsetStyle,
  defaultInputLabelStyle,
} from '../Fields/styles.css'
import { absoluteDropdownMenu, dropdownOption } from './DropdownSelect.css'

export interface SelectOption<T> {
  value: T
  label: string
  icon?: ReactNode
}

interface DropdownSelectProps<T> {
  value: T
  options: SelectOption<T>[]
  inputLabel?: string | ReactElement
  onChange: (value: T) => void
  disabled?: boolean
  isLoading?: boolean
  positioning?: 'inline' | 'absolute'
  customLabel?: string | ReactNode
  variant?: 'default' | 'button'
  buttonVariant?: ButtonProps['variant']
  buttonSize?: ButtonProps['size']
  align?: 'left' | 'right'
}

export function DropdownSelect<T extends React.Key>({
  value,
  onChange,
  options,
  inputLabel,
  disabled = false,
  isLoading = false,
  positioning = 'inline',
  customLabel,
  variant = 'default',
  buttonVariant = 'primary',
  buttonSize = 'md',
  align = 'left',
}: React.PropsWithChildren<DropdownSelectProps<T>>) {
  const [showOptions, setShowOptions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleOptionSelect = (option: SelectOption<T>) => {
    onChange(option.value)
    setShowOptions(false)
  }

  const selectedOption = options.find((option) => option.value === value)
  const displayLabel = customLabel || selectedOption?.label

  // Click outside handler for absolute positioning
  useEffect(() => {
    if (positioning === 'absolute' && showOptions) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setShowOptions(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [positioning, showOptions])

  const inlineVariants = {
    init: {
      height: 0,
      overflow: 'hidden' as const,
      boxShadow: 'none',
      transition: {
        ease: 'easeInOut' as const,
      },
    },
    open: {
      height: 'auto' as const,
      transition: {
        ease: 'easeInOut' as const,
      },
    },
  }

  const absoluteVariants = {
    init: {
      opacity: 0,
      y: -10,
      transition: {
        ease: 'easeInOut' as const,
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        ease: 'easeInOut' as const,
        duration: 0.2,
      },
    },
  }

  return (
    <Box
      as="fieldset"
      mb={'x4'}
      p={'x0'}
      className={defaultFieldsetStyle}
      ref={containerRef}
      style={{
        position: positioning === 'absolute' ? 'relative' : undefined,
        overflow: positioning === 'absolute' ? 'visible' : undefined,
      }}
    >
      {inputLabel && <label className={defaultInputLabelStyle}>{inputLabel}</label>}
      {variant === 'button' ? (
        // Button variant - use actual Button component
        <Button
          variant={buttonVariant}
          size={buttonSize}
          disabled={disabled}
          loading={isLoading}
          onClick={() => {
            if (!disabled) {
              setShowOptions(!showOptions)
            }
          }}
          icon={showOptions ? 'chevronUp' : 'chevronDown'}
          iconAlign="right"
        >
          {displayLabel}
        </Button>
      ) : (
        // Default variant - input field style
        <Flex
          direction={'column'}
          width={'100%'}
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
          borderColor={'border'}
          backgroundColor={'background1'}
          cursor={disabled ? 'auto' : 'pointer'}
        >
          <Flex
            onClick={() => {
              if (!disabled) {
                setShowOptions(!showOptions)
              }
            }}
          >
            <Flex
              pl={'x4'}
              direction={'row'}
              align={'center'}
              height={'x18'}
              width={'100%'}
              fontSize={16}
              fontWeight={'display'}
            >
              {selectedOption?.icon && <Flex pr={'x4'}>{selectedOption.icon}</Flex>}
              {displayLabel}
            </Flex>
            {isLoading ? (
              <Flex
                pr={'x4'}
                direction="row"
                h="100%"
                align="center"
                justify="center"
                alignSelf="center"
              >
                <Spinner size={'sm'} />
              </Flex>
            ) : (
              <Icon
                id={showOptions ? 'chevronUp' : 'chevronDown'}
                size={'md'}
                align={'center'}
                pr={'x4'}
              />
            )}
          </Flex>
          {positioning === 'inline' && (
            <AnimatePresence>
              <motion.div
                initial={'init'}
                animate={showOptions ? 'open' : 'init'}
                variants={inlineVariants}
              >
                <Flex backgroundColor="border" height="x1" />
                {options.map((option) => (
                  <Flex
                    key={option.value}
                    onClick={() => handleOptionSelect(option)}
                    className={defaultDropdownSelectOptionStyle}
                    pl={'x4'}
                    direction={'row'}
                    align={'center'}
                    height={'x18'}
                    width={'100%'}
                    fontSize={16}
                    fontWeight={'display'}
                  >
                    {option.icon && <Flex pr={'x4'}>{option.icon}</Flex>}
                    {option.label}
                  </Flex>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </Flex>
      )}
      {positioning === 'absolute' && (
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={'init'}
              animate={'open'}
              exit={'init'}
              variants={absoluteVariants}
              className={absoluteDropdownMenu[align]}
            >
              {options.map((option) => (
                <Flex
                  key={option.value}
                  onClick={() => handleOptionSelect(option)}
                  className={dropdownOption}
                  pl={'x4'}
                  direction={'row'}
                  align={'center'}
                  height={'x18'}
                  width={'100%'}
                  fontSize={16}
                  fontWeight={'display'}
                >
                  {option.icon && <Flex pr={'x4'}>{option.icon}</Flex>}
                  {option.label}
                </Flex>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Box>
  )
}
