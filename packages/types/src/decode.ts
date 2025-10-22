export type PrimitiveValue = string

export interface TupleValue {
  [key: string]: PrimitiveValue | PrimitiveValue[] | TupleValue | TupleValue[]
}

export type DecodedValue = PrimitiveValue | PrimitiveValue[] | TupleValue | TupleValue[]

export type DecodedArg<T extends string = string> = {
  name: T
  type: string
  value: DecodedValue
}

export type DecodedArgs<ArgName extends string = string> = {
  [K in ArgName]: DecodedArg<K>
}

export type DecodedTransactionData<TArgs extends DecodedArgs = DecodedArgs> = {
  args: TArgs
  argOrder: (keyof TArgs & string)[]
  functionName: string
  functionSig: string
  encodedData: string
}
