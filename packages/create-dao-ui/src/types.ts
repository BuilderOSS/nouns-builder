import { ReactElement } from 'react'

export interface CreateFormSection {
  title: string
  heading?: string
  subHeading?: string
  form: ReactElement
}
