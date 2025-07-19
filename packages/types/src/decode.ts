export type PrimitiveValue = string

export type TupleValue = Record<
  string,
  PrimitiveValue | PrimitiveValue[] | Record<string, PrimitiveValue>
>

export type DecodedValue = PrimitiveValue | PrimitiveValue[] | TupleValue | TupleValue[]

export type DecodedArg = {
  name: string
  type: string
  value: DecodedValue
}

export type DecodedTransactionData = {
  args: Record<string, DecodedArg>
  functionName: string
  functionSig: string
}
