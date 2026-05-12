export const versions = ['1.1.0', '1.2.0', '2.0.0'] as const

export type VersionType = (typeof versions)[number]

type ContractVersion = {
  [key: string]: {
    description: string
    date: string
  }
}

export const CONTRACT_VERSION_DETAILS: ContractVersion = {
  '2.0.0': {
    description:
      'This optional release upgrades the DAO to V2 to add custom metadata renderers, protocol rewards and more.',
    date: '2024-01-17',
  },
  '1.2.0': {
    description:
      'This release upgrades the DAO to V1.2 to add several features, improvements and bug fixes.',
    date: '2023-02-09',
  },
  '1.1.0': {
    description:
      'This release upgrades the DAO to V1.1 to add several features, improvements and bug fixes.',
    date: '2022-12-22',
  },
}
