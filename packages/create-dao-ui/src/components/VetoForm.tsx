import { Radio, SmartInput } from '@buildeross/ui/Fields'
import { defaultBackButton, defaultFormButtonWithPrev } from '@buildeross/ui/styles'
import { getEnsAddress } from '@buildeross/utils/ens'
import { isEmpty } from '@buildeross/utils/helpers'
import { addressValidationSchema } from '@buildeross/utils/yup'
import { atoms, Button, Flex, Icon } from '@buildeross/zord'
import { Form, Formik } from 'formik'
import { motion } from 'framer-motion'
import React, { BaseSyntheticEvent } from 'react'
import * as Yup from 'yup'

import { useFormStore } from '../stores'

interface VetoFormProps {
  title: string
}

interface VetoFromValues {
  vetoPower?: boolean
  vetoerAddress: string
}

const animation = {
  init: {
    height: 0,
  },
  open: {
    height: 'auto',
  },
}

export const vetoValidationSchema = Yup.object({
  vetoPower: Yup.boolean().required(),
  vetoerAddress: Yup.string().when(['vetoPower'], ([vetoPower], schema) =>
    vetoPower ? addressValidationSchema : schema.notRequired()
  ),
})

export const VetoForm: React.FC<VetoFormProps> = ({ title }) => {
  const {
    vetoPower,
    setVetoPower,
    vetoerAddress,
    setVetoerAddress,
    setFulfilledSections,
    activeSection,
    setActiveSection,
  } = useFormStore()
  const initialValues: VetoFromValues = {
    vetoPower: vetoPower,
    vetoerAddress: vetoerAddress,
  }

  const handleSubmit = async (values: VetoFromValues) => {
    const vetoPower = values.vetoPower
    const vetoerAddress = await getEnsAddress(values.vetoerAddress)
    if (vetoPower !== undefined) {
      setVetoPower(vetoPower)
      setVetoerAddress(vetoerAddress)
      setFulfilledSections(title)
      setActiveSection(activeSection + 1)
    }
  }

  const handlePrev = () => {
    setActiveSection(activeSection - 1)
  }

  return (
    <Formik<VetoFromValues>
      initialValues={initialValues}
      validationSchema={vetoValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
      validateOnMount={true}
      validateOnBlur={false}
    >
      {(formik) => (
        <Form>
          <Flex direction={'column'} w={'100%'}>
            <Radio
              {...formik.getFieldProps('vetoPower')}
              formik={formik}
              id={'vetoPower'}
              options={[
                { value: true, label: 'Yes' },
                { value: false, label: 'No' },
              ]}
            />
            <motion.div
              className={atoms({ overflow: 'hidden' })}
              variants={animation}
              initial={'init'}
              animate={formik.values.vetoPower ? 'open' : 'init'}
            >
              <SmartInput
                {...formik.getFieldProps('vetoerAddress')}
                formik={formik}
                inputLabel="Veto address"
                helperText="You may assign veto power to a multisig."
                onChange={({ target }: BaseSyntheticEvent) => {
                  formik.setFieldValue('vetoerAddress', target.value)
                }}
                id="vetoerAddress"
                type={'text'}
                placeholder={'0x... or .eth'}
                onBlur={formik.handleBlur}
                autoSubmit={false}
                isAddress={true}
                errorMessage={
                  formik.touched['vetoerAddress'] && formik.errors['vetoerAddress']
                    ? formik.errors['vetoerAddress']
                    : undefined
                }
              />
            </motion.div>

            <Flex>
              <Button
                justify={'center'}
                align={'center'}
                h={'x15'}
                minH={'x15'}
                minW={'x15'}
                onClick={() => handlePrev()}
                className={defaultBackButton}
                aria-label="Back"
              >
                <Icon id="arrowLeft" />
              </Button>
              <Button
                h={'x15'}
                className={defaultFormButtonWithPrev}
                type={'submit'}
                disabled={!isEmpty(formik.errors) || formik.isSubmitting}
                onMouseDown={(e: React.MouseEvent<HTMLElement>) => e.preventDefault()}
              >
                Continue
              </Button>
            </Flex>
          </Flex>
        </Form>
      )}
    </Formik>
  )
}
