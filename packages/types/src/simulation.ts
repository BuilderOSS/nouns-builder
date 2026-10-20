export type SimulationOutput = {
  status: boolean
  gas_used: number
  block_number: number
  from: string
  to: string
  input: string
  value: string
  // the following are added manually after simulation
  index: number
  // decoded revert reason, set when status is false
  error?: string
}

export type SimulationResult = {
  simulations: SimulationOutput[]
  success: boolean
  totalGasUsed: string
  error: string | null
}
