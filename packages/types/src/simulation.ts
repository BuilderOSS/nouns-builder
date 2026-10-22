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
  // set (with status false) when the call was skipped because the simulation
  // stopped at an earlier call; error says why
  notSimulated?: true
}

export type SimulationResult = {
  simulations: SimulationOutput[]
  success: boolean
  totalGasUsed: string
  error: string | null
}
