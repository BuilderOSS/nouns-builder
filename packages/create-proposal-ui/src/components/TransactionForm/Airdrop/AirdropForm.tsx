import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import type { FormikHelpers } from 'formik'
import { FieldArray, Form, Formik } from 'formik'
import type { FC } from 'react'
import { useCallback, useState } from 'react'

import airdropFormSchema, { AirdropFormValues } from './AirdropForm.schema'
import { CsvRecord, CsvUpload } from './CsvUpload'

export interface AirdropFormProps {
  onSubmit?: (
    values: AirdropFormValues,
    actions: FormikHelpers<AirdropFormValues>
  ) => void
  disabled?: boolean
}

const AirdropForm: FC<AirdropFormProps> = ({ onSubmit, disabled }) => {
  const [csvError, setCsvError] = useState<string>('')

  const initialValues: AirdropFormValues = {
    recipients: [{ address: '', amount: 0 }],
  }

  const handleSubmit = useCallback(
    (values: AirdropFormValues, actions: FormikHelpers<AirdropFormValues>) => {
      onSubmit?.(values, actions)
    },
    [onSubmit]
  )

  const handleCsvParsed = useCallback((records: CsvRecord[], formik: any) => {
    setCsvError('')
    const recipients = records.map((record) => ({
      address: record.address,
      amount: parseFloat(record.amount),
    }))
    formik.setFieldValue('recipients', recipients)
  }, [])

  const handleCsvError = useCallback((error: string) => {
    setCsvError(error)
  }, [])

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        validationSchema={airdropFormSchema}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => {
          const totalRecipients = formik.values.recipients?.length || 0
          const totalTokens =
            formik.values.recipients?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0

          return (
            <Box
              data-testid="airdrop-form"
              as={'fieldset'}
              disabled={formik.isValidating || disabled}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Flex as={Form} direction={'column'}>
                {/* CSV Upload Section */}
                <CsvUpload
                  onCsvParsed={(records) => handleCsvParsed(records, formik)}
                  onError={handleCsvError}
                  disabled={disabled}
                />

                {csvError && (
                  <Box mt="x3" p="x3" backgroundColor="negative" borderRadius="curved">
                    <Text
                      color="onNegative"
                      fontSize="14"
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {csvError}
                    </Text>
                  </Box>
                )}

                {/* Manual Entry Section */}
                <Box mt="x6">
                  <Flex justify="space-between" align="center" mb="x4">
                    <Text fontWeight="display">Recipients</Text>
                    <Text fontSize="14" color="text3">
                      {totalRecipients} recipient{totalRecipients === 1 ? '' : 's'} •{' '}
                      {totalTokens} total token{totalTokens === 1 ? '' : 's'}
                    </Text>
                  </Flex>

                  <FieldArray name="recipients">
                    {({ push, remove }) => (
                      <Flex direction="column" gap="x4">
                        {formik.values.recipients.map((_recipient, index) => (
                          <Box
                            key={index}
                            p="x4"
                            borderRadius="curved"
                            borderStyle="solid"
                            borderWidth="thin"
                            borderColor="border"
                            backgroundColor="background1"
                          >
                            <Flex align="center" gap="x3">
                              <Box flex="2" style={{ marginBottom: '-32px' }}>
                                <SmartInput
                                  type={FIELD_TYPES.TEXT}
                                  formik={formik}
                                  {...formik.getFieldProps(`recipients.${index}.address`)}
                                  id={`recipients.${index}.address`}
                                  inputLabel={index === 0 ? 'Address' : ''}
                                  placeholder={'0x... or ENS name'}
                                  isAddress={true}
                                  errorMessage={
                                    formik.touched.recipients?.[index]?.address &&
                                    formik.errors.recipients?.[index] &&
                                    typeof formik.errors.recipients[index] === 'object' &&
                                    'address' in formik.errors.recipients[index]
                                      ? (formik.errors.recipients[index] as any).address
                                      : undefined
                                  }
                                />
                              </Box>

                              <Box flex="1" style={{ marginBottom: '-32px' }}>
                                <SmartInput
                                  id={`recipients.${index}.amount`}
                                  inputLabel={index === 0 ? 'Amount' : ''}
                                  type={FIELD_TYPES.NUMBER}
                                  formik={formik}
                                  {...formik.getFieldProps(`recipients.${index}.amount`)}
                                  placeholder={'0'}
                                  min={0}
                                  errorMessage={
                                    formik.touched.recipients?.[index]?.amount &&
                                    formik.errors.recipients?.[index] &&
                                    typeof formik.errors.recipients[index] === 'object' &&
                                    'amount' in formik.errors.recipients[index]
                                      ? (formik.errors.recipients[index] as any).amount
                                      : undefined
                                  }
                                />
                              </Box>

                              {formik.values.recipients.length > 1 && (
                                <Flex h="100%" align="center" justify="center">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                    disabled={disabled}
                                    style={{
                                      alignSelf: index === 0 ? 'flex-end' : 'center',
                                      paddingRight: '4px',
                                      paddingLeft: '4px',
                                      minWidth: '32px',
                                      marginTop: index === 0 ? '32px' : '0',
                                    }}
                                  >
                                    <Icon id="cross" />
                                  </Button>
                                </Flex>
                              )}
                            </Flex>
                          </Box>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => push({ address: '', amount: 0 })}
                          disabled={disabled || formik.values.recipients.length >= 100}
                          style={{ alignSelf: 'flex-start' }}
                        >
                          <Icon id="plus" />
                          Add Recipient
                        </Button>
                      </Flex>
                    )}
                  </FieldArray>
                </Box>

                {/* Form-level errors */}
                {formik.errors.recipients &&
                  typeof formik.errors.recipients === 'string' && (
                    <Box mt="x3" p="x3" backgroundColor="negative" borderRadius="curved">
                      <Text color="onNegative" fontSize="14">
                        {formik.errors.recipients}
                      </Text>
                    </Box>
                  )}

                <Button
                  mt={'x9'}
                  variant={'outline'}
                  borderRadius={'curved'}
                  type="submit"
                  disabled={!formik.isValid || disabled || !!csvError}
                >
                  Add Transaction to Queue
                </Button>
              </Flex>
            </Box>
          )
        }}
      </Formik>
    </Box>
  )
}

export default AirdropForm
