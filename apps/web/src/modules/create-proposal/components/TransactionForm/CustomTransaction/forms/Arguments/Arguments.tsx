import { FIELD_TYPES } from '@buildeross/ui/Fields'
import {
  matchInputFromName,
  matchTypeParameters,
  normalizePathName,
  RAW_DATA_KEY,
} from '@buildeross/utils/formABI'
import { camelToTitle } from '@buildeross/utils/helpers'
import { Flex } from '@buildeross/zord'
import isEqual from 'lodash/isEqual'
import React from 'react'
import { useCustomTransactionStore } from 'src/modules/create-proposal'
import { encodeAbiParameters, isAddress, isHex } from 'viem'
import * as Yup from 'yup'

import { CustomTransactionForm } from '../CustomTransactionForm'

export const Arguments = () => {
  const { customTransaction, composeCustomTransaction } = useCustomTransactionStore()

  /*
  
  construct fields

 */
  const fields = React.useMemo(() => {
    const typeHelperText: any = {
      ['address[]']: 'address[] - two or more addresses seperated by a " , "',
    }

    function getFieldsFromInputs(path: string[], inputs: any) {
      let result: any = []
      inputs.forEach((input: any) => {
        if (input.type === 'tuple') {
          result = result.concat(
            getFieldsFromInputs([...path, input.name], input.components)
          )
        } else {
          const name = normalizePathName(input.name, path)
          result.push({
            inputLabel: name,
            helperText: typeHelperText[input.type] || input.type,
            placeholder: camelToTitle(input.name),
            name,
            path: path,
            type: FIELD_TYPES.TEXT,
          })
        }
      })
      return result
    }

    if (customTransaction.contract) {
      return getFieldsFromInputs([], customTransaction.function?.inputs)
    } else {
      return [
        {
          inputLabel: 'Raw Calldata',
          helperText: 'Call data as hex (Leave blank to just send value)',
          name: RAW_DATA_KEY,
          type: FIELD_TYPES.TEXTAREA,
        },
      ]
    }
  }, [customTransaction])

  /*

     submit callback
       
   */

  const submitCallback = React.useCallback(
    (values: typeof initialValues) => {
      const args = fields.reduce((acc: any[] = [], cv: any) => {
        acc.push([cv.name, values[cv.name]])

        return acc
      }, [])
      composeCustomTransaction({ ...customTransaction, arguments: args })
    },
    [customTransaction, fields, composeCustomTransaction]
  )

  /*
    
    construct field validation
  
   */
  //TODO:: use argument type to create validation i.e uint256, address, etc.
  const validationSchema = React.useMemo(() => {
    if (!fields.length) return

    const validators = fields.reduce((acc = Yup.object().shape({}), cv: any) => {
      if (cv.name === RAW_DATA_KEY) {
        return {
          [cv.name]: Yup.string().test(
            'is valid hex string',
            'invalid hex string',
            (value: string | undefined) => !!(!value || isHex(value))
          ),
        }
      }
      const matchedInput = matchInputFromName(cv.name, customTransaction.function.inputs)

      const type = matchedInput ? matchedInput.type : 'unknown'

      const { argumentTypePrefix, isArray } = matchTypeParameters(type)

      const _concat = () => {
        if (isArray) {
          return {
            [cv.name]: Yup.string()
              .required('*')
              .test('is valid abi type', 'invalid abi type', (value) => {
                const list = value?.replace(/\s/g, '').split(',')
                try {
                  encodeAbiParameters(
                    [
                      {
                        type,
                      },
                    ],
                    [list]
                  )
                  return true
                } catch (e) {
                  return false
                }
              }),
          }
        }
        switch (argumentTypePrefix) {
          case 'address':
            return {
              [cv.name]: Yup.string()
                .required('*')
                .test(
                  'isValidAddress',
                  'invalid address',
                  (value: string | undefined) => !!value && isAddress(value)
                ),
            }
          case 'unknown':
            return {}
          default: {
            return {
              [cv.name]: Yup.string()
                .required('*')
                .test('is valid abi', 'invalid abi type', (value: string | undefined) => {
                  if (value === undefined) {
                    return false
                  }
                  try {
                    encodeAbiParameters(
                      [
                        {
                          type,
                        },
                      ],
                      [value]
                    )
                    return true
                  } catch (e) {
                    return false
                  }
                }),
            }
          }
        }
      }
      return { ...acc, ..._concat() }
    }, [])

    return Yup.object().shape({ ...validators })
  }, [fields, customTransaction])

  /*

    initialValues

   */
  // TODO(iain): Fix this functionality
  const initialValues = React.useMemo(() => {
    if (!customTransaction.arguments?.length)
      return fields.reduce((acc: {} = {}, cv: { inputLabel: string }) => {
        acc = { ...acc, [cv.inputLabel]: '' }

        return acc
      }, [])

    const stored = customTransaction?.arguments?.map((_: any, key: any) => key)
    const current = fields.reduce((acc: string[] = [], cv: any) => {
      acc.push(cv.name)
      return acc
    }, [])

    let args = {}
    for (const [key, value] of customTransaction?.arguments) {
      let arg = { [key]: value }
      args = { ...args, ...arg }
    }

    return isEqual(stored.sort(), current.sort()) ? { ...args } : {}
  }, [customTransaction?.arguments, fields])

  return (
    <Flex direction={'column'}>
      <CustomTransactionForm
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        submitCallback={submitCallback}
        validateOnBlur={true}
      />
    </Flex>
  )
}
