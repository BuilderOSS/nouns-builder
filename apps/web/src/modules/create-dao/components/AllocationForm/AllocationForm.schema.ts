import { addressValidationSchema } from '@buildeross/utils/yup'
import * as Yup from 'yup'

export const allocationSchema = Yup.object({
  founderAddress: addressValidationSchema,
  allocationPercentage: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('*')
    .integer('Must be whole number')
    .max(100, '< 100')
    .when(['admin'], ([admin], schema) => (!admin ? schema.min(1, '> 0') : schema)),
  endDate: Yup.string()
    .required('*')
    .test('isDateInFuture', 'Must be in future', (value?: string) => {
      if (!value) return false
      const date = new Date(value)
      return date > new Date()
    }),
  admin: Yup.boolean().default(false),
})

export const validationSchemaContributions = Yup.object({
  builderAllocation: Yup.mixed().when([], {
    is: (val: unknown) => !!val,
    then: () => allocationSchema,
    otherwise: () => Yup.mixed().notRequired(),
  }),
  nounsAllocation: Yup.mixed().when([], {
    is: (val: unknown) => !!val,
    then: () => allocationSchema,
    otherwise: () => Yup.mixed().notRequired(),
  }),
})

export const validationSchemaFounderAllocation = (signerAddress: string | null) =>
  Yup.object({
    founderAllocation: Yup.array()
      .of(allocationSchema)
      .min(1, 'Founder is required')
      .test(
        'founderAddress',
        'The founder must be the connected wallet.',
        function (value) {
          if (value?.[0]) {
            return value[0].founderAddress === signerAddress
          }
          return false
        }
      )
      .test(
        'unique',
        'Founder allocation addresses should be unique.',
        function (values) {
          const addresses = values?.map((v) => v.founderAddress)
          return values?.length === new Set(addresses).size
        }
      ),
  })
