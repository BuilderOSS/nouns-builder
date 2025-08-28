import { Button, Flex, Stack } from '@buildeross/zord'
import { useFormikContext } from 'formik'
import React, { useCallback } from 'react'
import DatePicker from 'src/components/Fields/Date'
import SmartInput from 'src/components/Fields/SmartInput'
import { NUMBER, TEXTAREA } from 'src/components/Fields/types'
import { Icon } from 'src/components/Icon'
import SingleMediaUpload from 'src/components/SingleMediaUpload/SingleMediaUpload'

import { EscrowFormValues } from './EscrowForm.schema'

export const MilestoneForm: React.FC<{
  index: number
  setIsMediaUploading: React.Dispatch<React.SetStateAction<boolean>>
  removeMilestone: () => void
}> = ({ index, removeMilestone, setIsMediaUploading }) => {
  const formik = useFormikContext<EscrowFormValues>()

  const handleMediaUploadStart = useCallback(
    (media: File) => {
      formik.setFieldValue(`milestones.${index}.mediaType`, media.type)
      formik.setFieldValue(`milestones.${index}.mediaFileName`, media.name)
      setIsMediaUploading(true)
    },
    [formik, index, setIsMediaUploading]
  )

  return (
    <Stack gap={'x4'}>
      <SmartInput
        {...formik.getFieldProps(`milestones.${index}.amount`)}
        inputLabel="Amount"
        id={`milestones.${index}.amount`}
        type={NUMBER}
        placeholder={``}
        errorMessage={
          (formik.touched?.milestones as any)?.[index]?.amount &&
          (formik.errors?.milestones as any)?.[index]?.amount
            ? (formik.errors?.milestones as any)?.[index]?.amount
            : undefined
        }
      />
      <SmartInput
        {...formik.getFieldProps(`milestones.${index}.title`)}
        id={`milestones.${index}.title`}
        inputLabel="Title"
        type={'text'}
        placeholder={'Milestone Title'}
        errorMessage={(formik.errors?.milestones as any)?.[index]?.title ?? undefined}
      />

      <SmartInput
        {...formik.getFieldProps(`milestones.${index}.description`)}
        type={TEXTAREA}
        formik={formik}
        id={`milestones.${index}.description`}
        value={formik.values?.milestones[index]?.description}
        inputLabel="Description"
        placeholder={'Milestone description is highly encouraged'}
      />

      <DatePicker
        {...formik.getFieldProps(`milestones.${index}.endDate`)}
        formik={formik}
        id={`milestones.${index}.endDate`}
        inputLabel={'Delivery Date'}
        placeholder={'yyyy-mm-dd'}
        dateFormat="Y-m-d"
        errorMessage={(formik.errors?.milestones as any)?.[index]?.endDate ?? undefined}
      />

      <SingleMediaUpload
        {...formik.getFieldProps(`milestones.${index}.mediaUrl`)}
        formik={formik}
        id={`milestones.${index}.mediaUrl`}
        inputLabel={'Media'}
        onUploadStart={handleMediaUploadStart}
        onUploadSettled={() => setIsMediaUploading(false)}
      />

      <Flex
        style={{
          justifyContent: 'flex-end',
        }}
      >
        {formik.values.milestones.length > 1 && (
          <Button variant="outline" width={'auto'} onClick={removeMilestone}>
            <Icon id="trash" />
          </Button>
        )}
      </Flex>
    </Stack>
  )
}
