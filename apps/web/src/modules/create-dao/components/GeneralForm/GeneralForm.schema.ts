import { urlValidationSchema } from '@buildeross/utils/yup'
import * as Yup from 'yup'

export interface GeneralFormValues {
  daoAvatar?: string
  daoName: string
  daoSymbol: string
  daoWebsite?: string
}

export const generalValidationSchema = Yup.object().shape({
  daoAvatar: Yup.string(),
  daoName: Yup.string().required('*').max(255),
  daoSymbol: Yup.string()
    .max(24, '<= 24 characters')
    .matches(/^[$]*[a-zA-Z0-9_-]*$/i)
    .required('*'),
  daoWebsite: urlValidationSchema,
})
