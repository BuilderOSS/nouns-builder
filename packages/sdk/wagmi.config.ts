import { defineConfig } from '@wagmi/cli'
import { actions } from '@wagmi/cli/plugins'


import {
  governorAbi,
  auctionAbi,
  managerAbi,
  managerV2Abi,
  tokenAbi,
  treasuryAbi,
  metadataAbi,
  merklePropertyMetadataAbi,
  zoraNFTCreatorAbi,
  messengerAbi,
  l2DeployerAbi,
  erc20Abi,
  erc721Abi,
  erc1155Abi
} from './src/contract/abis'
const contracts = [
  {
    name: 'Governor',
    abi: governorAbi,
  },
  {
    name: 'Auction',
    abi: auctionAbi,
  },
  {
    name: 'Manager',
    abi: managerAbi,
  },
  {
    name: 'ManagerV2',
    abi: managerV2Abi,
  },
  {
    name: 'Token',
    abi: tokenAbi,
  },
  {
    name: 'Treasury',
    abi: treasuryAbi,
  },
  {
    name: 'Metadata',
    abi: metadataAbi,
  },
  {
    name: 'MerklePropertyMetadata',
    abi: merklePropertyMetadataAbi,
  },
  {
    name: 'ZoraNFTCreator',
    abi: zoraNFTCreatorAbi,
  },
  {
    name: 'Messenger',
    abi: messengerAbi,
  },
  {
    name: 'L2MigrationDeployer',
    abi: l2DeployerAbi,
  },
  {
    name: 'ERC20',
    abi: erc20Abi,
  },
  {
    name: 'ERC721',
    abi: erc721Abi,
  },
  {
    name: 'ERC1155',
    abi: erc1155Abi,
  },
]

const plugins = [
  actions(),
]

export default defineConfig({ out: 'src/contract/generated.ts', contracts, plugins })
