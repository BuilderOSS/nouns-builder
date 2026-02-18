import { type ReactNode } from 'react'

export type FormComponentProps = { resetTransactionType: () => void }

export type FormComponent = (props: FormComponentProps) => ReactNode

export const requireResetForm = (c: FormComponent): FormComponent => c
