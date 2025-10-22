export const versions = ['1.1.0', '1.2.0'] as const

export type VersionType = (typeof versions)[number]

type ContractVersion = {
  [key: string]: {
    description: string
    date: string
  }
}

// Note: This is meant to keep record of implementations for several intermediary versions. These are also subject to change.
export const CONTRACT_VERSION_ADDRESSES = {
  1: {
    '1.2.0': {
      auction: '0x785708d09b89c470ad7b5b3f8ac804ce72b6b282',
      token: '0xaed75d1e5c1821e2ec29d5d24b794b13c34c5d63',
      metadata: '0x5a28eef0ed8cce44cda9d7097ecce041bb51b9d4',
      treasury: '0x3bdafe0d299168f6ebb6e1b4e1e9702a30f6364d',
      governor: '0x46ea3fd17deb7b291aea60e67e5cb3a104fea11d',
    },
    '1.1.0': {
      auction: '0x2661fe1a882abfd28ae0c2769a90f327850397c6',
      token: '0xe6322201ced0a4d6595968411285a39ccf9d5989',
      metadata: '0x26f494af990123154e7cc067da7a311b07d54ae1',
      treasury: '0x0b6d2473f54de3f1d80b27c92b22d13050da289a',
      governor: '0x9eefef0891b1895af967fe48c5d7d96e984b96a3',
    },
  },
  5: {
    '1.2.0': {
      auction: '0xa6a2956fa075d50b021385478A99f3642dAfCc2C',
      token: '0xe26CA51f2daeE681F2802237D51c6a7982858345',
      metadata: '0x419074d73Cf0852e46b8531b430B1230C348C291',
      treasury: '0x243f389eB3E0505FC2857a1b7025789AB500E2d1',
      governor: '0xdA48f625903547Dc7B70Ad8E019e7dFc55d0aA96',
    },
    '1.1.0': {
      auction: '0x5bde6cf41cd7aa5b6e522ffa491f1bf6c6607bd3',
      token: '0xac193e2126f0e7734f2ac8da9d4002935b3c1d75',
      metadata: '0x94d792e07216796cb235e328823199fb8da3c911',
      treasury: '0x935522cf33ae425187aeec69737bd30ab56bd16e',
      governor: '0x04b2c0ea4ea3e9c92f0555fd0fb9c9564e25c52e',
    },
  },
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
