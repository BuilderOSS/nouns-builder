import {
  Box,
  Flex,
  InputComponentProps,
  Text,
  Input as ZordInput,
} from '@buildeross/zord'
import { Field } from 'formik'
import type { FC, ReactNode } from 'react'

import { Error } from 'src/components/Fields/Error'

import { input } from './Input.css'

interface CustomInputProps extends InputComponentProps<typeof ZordInput> {
  label?: string | ReactNode
  secondaryLabel?: string | ReactNode
  name?: string
  type?: string
  placeholder?: string | number
  autoComplete?: 'off'
  error?: string
}

const Input: FC<CustomInputProps> = ({
  name,
  label,
  secondaryLabel,
  type,
  placeholder,
  autoComplete,
  error,
  ...props
}) => {
  return (
    <>
      <Box as="label" htmlFor={name}>
        {typeof label === 'string' ? (
          <Text fontWeight={'display'} fontSize={16}>
            {label}
          </Text>
        ) : (
          label
        )}

        <Box mt={'x2'} position={'relative'}>
          <Field
            data-testid={name}
            as={ZordInput}
            className={input}
            type={type}
            name={name}
            placeholder={placeholder}
            autoComplete={autoComplete}
            data-error={typeof error !== 'undefined'}
            {...props}
          />
          <Flex
            position={'absolute'}
            top={'x0'}
            right={'x4'}
            align={'center'}
            justify={'center'}
            h={'100%'}
          >
            {typeof secondaryLabel === 'string' ? (
              <Text fontWeight={'display'} align={'center'} fontSize={16}>
                {secondaryLabel}
              </Text>
            ) : (
              secondaryLabel
            )}
          </Flex>
        </Box>
      </Box>

      {error ? <Error message={error} /> : null}
    </>
  )
}

export default Input
