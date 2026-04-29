import {
  Box,
  Button,
  ButtonProps,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
} from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  defaultDropdownSelectOptionStyle,
  defaultFieldsetStyle,
  defaultInputLabelStyle,
} from '../Fields/styles.css'
import { absoluteDropdownMenu, dropdownOption } from './DropdownSelect.css'

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

export interface SelectOption<T> {
  value: T
  label: string
  description?: string
  icon?: ReactNode
}

interface DropdownSelectProps<T> {
  value?: T
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
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const listboxId = useId()
  const inputLabelId = inputLabel ? `${listboxId}-label` : undefined

  const handleOptionSelect = (option: SelectOption<T>) => {
    onChange(option.value)
    setShowOptions(false)
  }

  const selectedOption = options.find((option) => option.value === value)
  const displayLabel = customLabel ?? selectedOption?.label ?? 'Select option'
  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value]
  )

  const closeOptions = () => {
    setShowOptions(false)
    setActiveIndex(-1)
  }

  const openOptions = () => {
    setShowOptions(true)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
  }

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

  useEffect(() => {
    if (!showOptions) return

    const defaultIndex = selectedIndex >= 0 ? selectedIndex : 0
    setActiveIndex((prev) => (prev >= 0 ? prev : defaultIndex))
  }, [selectedIndex, showOptions])

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!options.length || disabled) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!showOptions) {
        openOptions()
        return
      }

      const delta = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((prev) => {
        const current = prev >= 0 ? prev : selectedIndex >= 0 ? selectedIndex : 0
        return (current + delta + options.length) % options.length
      })
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      if (!showOptions) openOptions()
      setActiveIndex(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      if (!showOptions) openOptions()
      setActiveIndex(options.length - 1)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!showOptions) {
        openOptions()
        return
      }

      const option = options[activeIndex]
      if (option) {
        handleOptionSelect(option)
      }
      return
    }

    if (event.key === 'Escape' && showOptions) {
      event.preventDefault()
      closeOptions()
      triggerRef.current?.focus()
    }
  }

  // Shared option renderer
  const renderOptions = (optionClassName: string) =>
    options.map((option, index) => (
      <Flex
        key={option.value}
        id={`${listboxId}-option-${index}`}
        role="option"
        aria-selected={value === option.value}
        tabIndex={-1}
        onClick={() => handleOptionSelect(option)}
        onMouseEnter={() => setActiveIndex(index)}
        className={optionClassName}
        pl={'x4'}
        pr={option.description ? 'x4' : undefined}
        direction={'row'}
        align={'center'}
        py={option.description ? 'x3' : undefined}
        height={option.description ? undefined : 'x18'}
        minHeight={'x18'}
        width={'100%'}
        gap={option.description ? 'x3' : undefined}
        fontSize={option.description ? undefined : 16}
        fontWeight={option.description ? undefined : 'display'}
        backgroundColor={index === activeIndex ? 'background2' : 'background1'}
      >
        {option.icon && (
          <Flex pr={option.description ? undefined : 'x4'}>{option.icon}</Flex>
        )}

        {option.description ? (
          <Stack gap={'x1'} justify={'center'}>
            <Text fontSize={16} fontWeight={'display'}>
              {option.label}
            </Text>
            <Text color={'text3'} variant={'paragraph-sm'}>
              {option.description}
            </Text>
          </Stack>
        ) : (
          option.label
        )}
      </Flex>
    ))

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
      {inputLabel && (
        <label id={inputLabelId} className={defaultInputLabelStyle}>
          {inputLabel}
        </label>
      )}
      {variant === 'button' ? (
        // Button variant - use actual Button component
        <Button
          ref={triggerRef}
          variant={buttonVariant}
          size={buttonSize}
          disabled={disabled}
          loading={isLoading}
          aria-haspopup="listbox"
          aria-expanded={showOptions}
          aria-controls={listboxId}
          aria-labelledby={inputLabelId}
          aria-label={typeof inputLabel === 'string' ? inputLabel : undefined}
          aria-activedescendant={
            showOptions && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          onKeyDown={handleTriggerKeyDown}
          onClick={() => {
            if (!disabled) {
              if (showOptions) {
                closeOptions()
              } else {
                openOptions()
              }
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
          <Box
            as="button"
            ref={triggerRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={showOptions}
            aria-controls={listboxId}
            aria-labelledby={inputLabelId}
            aria-label={typeof inputLabel === 'string' ? inputLabel : displayLabel}
            aria-activedescendant={
              showOptions && activeIndex >= 0
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            onKeyDown={handleTriggerKeyDown}
            onClick={() => {
              if (!disabled) {
                if (showOptions) {
                  closeOptions()
                } else {
                  openOptions()
                }
              }
            }}
            style={{
              border: 0,
              background: 'transparent',
              width: '100%',
              textAlign: 'left',
              padding: 0,
              margin: 0,
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
          </Box>
          {positioning === 'inline' && (
            <motion.div
              id={listboxId}
              role="listbox"
              aria-labelledby={inputLabelId}
              initial={'init'}
              animate={showOptions ? 'open' : 'init'}
              variants={inlineVariants}
            >
              <Flex backgroundColor="border" height="x1" />
              {renderOptions(defaultDropdownSelectOptionStyle)}
            </motion.div>
          )}
        </Flex>
      )}
      {positioning === 'absolute' && (
        <AnimatePresence>
          {showOptions && (
            <motion.div
              id={listboxId}
              role="listbox"
              aria-labelledby={inputLabelId}
              initial={'init'}
              animate={'open'}
              exit={'init'}
              variants={absoluteVariants}
              className={absoluteDropdownMenu[align]}
            >
              {renderOptions(dropdownOption)}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Box>
  )
}
