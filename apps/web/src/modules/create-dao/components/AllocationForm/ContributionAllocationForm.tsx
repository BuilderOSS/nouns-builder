import {
  PUBLIC_BUILDER_ADDRESS,
  PUBLIC_NOUNS_ADDRESS,
} from '@buildeross/constants/addresses'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { DatePicker, SmartInput } from '@buildeross/ui/Fields'
import { yearsAhead } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { Form, Formik } from 'formik'
import { useChainStore } from 'src/stores'

import { TokenAllocation } from './AllocationForm'
import { validationSchemaContributions } from './AllocationForm.schema'
import { ContributionChain } from './ContributionAllocation'
import { DaoCopyAddress } from './DaoCopyAddress'
import { Toggle } from './Toggle'

export interface ContributionAllocationFormValues {
  builderAllocation?: TokenAllocation
  nounsAllocation?: TokenAllocation
}

export interface ContributionAllocationFormProps {
  initialValues: ContributionAllocationFormValues
  handleSubmit: (values: ContributionAllocationFormValues) => void
}

export const ContributionAllocationForm: React.FC<ContributionAllocationFormProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const chain = useChainStore((x) => x.chain)
  const chainId = chain.id as ContributionChain
  const { displayName: builderDisplayName } = useEnsData(PUBLIC_BUILDER_ADDRESS[chainId])
  const { displayName: nounsDisplayName } = useEnsData(PUBLIC_NOUNS_ADDRESS[chainId])

  return (
    <Formik<ContributionAllocationFormValues>
      initialValues={initialValues}
      enableReinitialize
      validateOnBlur={false}
      validateOnMount={true}
      validateOnChange={true}
      validationSchema={validationSchemaContributions}
      onSubmit={handleSubmit}
    >
      {(formik) => {
        const builderAllocation = formik.values.builderAllocation
        const nounsAllocation = formik.values.nounsAllocation

        return (
          <Form>
            <Stack>
              <Text fontSize={28} fontWeight={'display'} mb={'x4'}>
                Change Contributions
              </Text>

              <Box mt={'x4'}>
                <Flex justify={'space-between'} mb={'x4'}>
                  <Text fontWeight={'display'}>Builder Contribution</Text>

                  <Toggle
                    on={!!builderAllocation}
                    onToggle={() => {
                      formik.setFieldValue(
                        'builderAllocation',
                        builderAllocation
                          ? undefined
                          : {
                              founderAddress: PUBLIC_BUILDER_ADDRESS[chainId],
                              allocation: 1,
                              endDate: yearsAhead(5),
                            }
                      )
                    }}
                  />
                </Flex>

                {!!builderAllocation && (
                  <Flex direction={'row'} mt={'x4'}>
                    <DaoCopyAddress
                      name="Builder"
                      image="/builder-avatar-circle.png"
                      ens={builderDisplayName}
                      address={PUBLIC_BUILDER_ADDRESS[chainId]}
                    />

                    <SmartInput
                      inputLabel={'Percentage'}
                      id={`builderAllocation.allocationPercentage`}
                      value={builderAllocation.allocationPercentage}
                      type={'number'}
                      formik={formik}
                      disabled={false}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      perma={'%'}
                      autoSubmit={false}
                      isAddress={false}
                      // @ts-ignore
                      errorMessage={formik.errors.builderAllocation?.allocation}
                    />

                    <DatePicker
                      id={`builderAllocation.endDate`}
                      value={builderAllocation.endDate}
                      inputLabel={'End date'}
                      formik={formik}
                      autoSubmit={false}
                      disabled={false}
                      // @ts-ignore
                      errorMessage={formik.errors.builderAllocation?.endDate}
                    />
                  </Flex>
                )}
              </Box>

              <Box
                h={'x0'}
                borderStyle={'solid'}
                borderColor={'border'}
                borderWidth={'thin'}
                my={'x4'}
              />

              <Box mb={'x4'}>
                <Flex justify={'space-between'} mb={'x4'}>
                  <Text fontWeight={'display'}>Nouns Contribution</Text>

                  <Toggle
                    on={!!nounsAllocation}
                    onToggle={() => {
                      formik.setFieldValue(
                        'nounsAllocation',
                        nounsAllocation
                          ? undefined
                          : {
                              founderAddress: PUBLIC_NOUNS_ADDRESS[chainId],
                              allocation: 1,
                              endDate: yearsAhead(5),
                            }
                      )
                    }}
                  />
                </Flex>

                {!!nounsAllocation && (
                  <Flex direction={'row'} mt={'x4'}>
                    <DaoCopyAddress
                      name="Nouns"
                      image="/nouns-avatar-circle.png"
                      ens={nounsDisplayName}
                      address={PUBLIC_NOUNS_ADDRESS[chainId]}
                    />

                    <SmartInput
                      inputLabel={'Percentage'}
                      id={`nounsAllocation.allocationPercentage`}
                      value={nounsAllocation.allocationPercentage}
                      type={'number'}
                      formik={formik}
                      disabled={false}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      perma={'%'}
                      autoSubmit={false}
                      isAddress={false}
                      // @ts-ignore
                      errorMessage={formik.errors.nounsAllocation?.allocation}
                    />

                    <DatePicker
                      id={`nounsAllocation.endDate`}
                      value={nounsAllocation.endDate}
                      inputLabel={'End date'}
                      formik={formik}
                      autoSubmit={false}
                      disabled={false}
                      // @ts-ignore
                      errorMessage={formik.errors.nounsAllocation?.endDate}
                    />
                  </Flex>
                )}
              </Box>
            </Stack>

            <Button borderRadius="curved" type="submit" width={'100%'}>
              Save and Exit
            </Button>
          </Form>
        )
      }}
    </Formik>
  )
}
