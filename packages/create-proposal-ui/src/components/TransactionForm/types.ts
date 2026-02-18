import { ReactNode } from 'react'

type ResetTransactionTypeProps = { resetTransactionType: () => void }

type RequiresResetForm<T> = T extends (...args: infer A) => any
  ? A extends [infer P, ...any[]]
    ? ResetTransactionTypeProps extends P
      ? T
      : never
    : never
  : never

type FormComponentNotStrict = (props: { resetTransactionType: () => void }) => ReactNode

export type FormComponent = RequiresResetForm<FormComponentNotStrict>

export const requireResetForm = <T extends (...args: any[]) => any>(
  c: RequiresResetForm<T>
) => c
