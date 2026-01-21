import { keccak256, toHex } from 'viem'
import { auctionAbi } from '../src/contract/abis/Auction'
import { governorAbi } from '../src/contract/abis/Governor'
import { managerAbi } from '../src/contract/abis/Manager'
import { managerV1Abi } from '../src/contract/abis/ManagerV1'
import { tokenAbi } from '../src/contract/abis/Token'
import { treasuryAbi } from '../src/contract/abis/Treasury'

type AbiEvent = {
  type: 'event'
  name: string
  inputs: Array<{
    name: string
    type: string
    indexed?: boolean
    internalType?: string
    components?: Array<{
      name: string
      type: string
      internalType?: string
    }>
  }>
  anonymous?: boolean
}

const contracts = [
  { name: 'Auction', abi: auctionAbi },
  { name: 'Governor', abi: governorAbi },
  { name: 'Manager', abi: managerAbi },
  { name: 'ManagerV1', abi: managerV1Abi },
  { name: 'Token', abi: tokenAbi },
  { name: 'Treasury', abi: treasuryAbi },
]

function expandTupleType(input: AbiEvent['inputs'][0]): string {
  if (input.type === 'tuple' && input.components) {
    const componentTypes = input.components.map((c) => c.type).join(',')
    return `(${componentTypes})`
  }
  if (input.type === 'tuple[]' && input.components) {
    const componentTypes = input.components.map((c) => c.type).join(',')
    return `(${componentTypes})[]`
  }
  return input.type
}

function getEventSignature(event: AbiEvent): string {
  const params = event.inputs.map((input) => expandTupleType(input)).join(',')
  return `${event.name}(${params})`
}

function parseEvents() {
  console.log('='.repeat(80))
  console.log('CONTRACT EVENTS PARSER')
  console.log('='.repeat(80))
  console.log()

  for (const contract of contracts) {
    const events = contract.abi.filter((item: any) => item.type === 'event') as unknown as AbiEvent[]

    if (events.length === 0) {
      continue
    }

    console.log(`\n${'*'.repeat(80)}`)
    console.log(`CONTRACT: ${contract.name}`)
    console.log(`${'*'.repeat(80)}\n`)

    for (const event of events) {
      const signature = getEventSignature(event)
      const topic0 = keccak256(toHex(signature))

      console.log(`Event: ${event.name}`)
      console.log(`Signature: ${signature}`)
      console.log(`Anonymous: ${event.anonymous || false}`)
      console.log()

      // Topic 0 (event signature hash) - not present if anonymous
      if (!event.anonymous) {
        console.log(`  Topic 0 (Event Signature Hash):`)
        console.log(`    ${topic0}`)
        console.log()
      }

      // Indexed parameters (Topics 1-3)
      const indexedParams = event.inputs.filter((input) => input.indexed)
      if (indexedParams.length > 0) {
        console.log(`  Indexed Parameters (Topics ${event.anonymous ? '0' : '1'}-${event.anonymous ? indexedParams.length - 1 : indexedParams.length}):`)
        indexedParams.forEach((param, index) => {
          const topicNum = event.anonymous ? index : index + 1
          console.log(`    Topic ${topicNum}:`)
          console.log(`      Name: ${param.name || '(unnamed)'}`)
          console.log(`      Type: ${param.type}`)
          if (param.internalType) {
            console.log(`      Internal Type: ${param.internalType}`)
          }
        })
        console.log()
      }

      // Non-indexed parameters (in event data)
      const nonIndexedParams = event.inputs.filter((input) => !input.indexed)
      if (nonIndexedParams.length > 0) {
        console.log(`  Non-Indexed Parameters (Event Data):`)
        nonIndexedParams.forEach((param) => {
          console.log(`    - Name: ${param.name || '(unnamed)'}`)
          console.log(`      Type: ${param.type}`)
          if (param.internalType) {
            console.log(`      Internal Type: ${param.internalType}`)
          }
        })
        console.log()
      }

      console.log('-'.repeat(80))
      console.log()
    }
  }
}

// Run the parser
parseEvents()
