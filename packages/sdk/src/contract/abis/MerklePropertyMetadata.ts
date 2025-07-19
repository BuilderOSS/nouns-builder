export const merklePropertyMetadataAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_manager',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
    ],
    name: 'AddressEmptyCode',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'ERC1967InvalidImplementation',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ERC1967NonPayable',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedInnerCall',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'INVALID_MERKLE_PROOF',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'selectedPropertyId',
        type: 'uint256',
      },
    ],
    name: 'INVALID_PROPERTY_SELECTED',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'impl',
        type: 'address',
      },
    ],
    name: 'INVALID_UPGRADE',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInitialization',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotInitializing',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONE_PROPERTY_AND_ITEM_REQUIRED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_MANAGER',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_OWNER',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ONLY_TOKEN',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    name: 'StringsInsufficientHexLength',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'TOKEN_NOT_MINTED',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TOO_MANY_PROPERTIES',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UUPSUnauthorizedCallContext',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'slot',
        type: 'bytes32',
      },
    ],
    name: 'UUPSUnsupportedProxiableUUID',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'key',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'value',
            type: 'string',
          },
          {
            internalType: 'bool',
            name: 'quote',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct IBaseMetadata.AdditionalTokenProperty[]',
        name: '_additionalJsonProperties',
        type: 'tuple[]',
      },
    ],
    name: 'AdditionalTokenPropertiesSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'prevImage',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'newImage',
        type: 'string',
      },
    ],
    name: 'ContractImageUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'prevDescription',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'newDescription',
        type: 'string',
      },
    ],
    name: 'DescriptionUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'version',
        type: 'uint64',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
    ],
    name: 'PropertyAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'prevRendererBase',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'newRendererBase',
        type: 'string',
      },
    ],
    name: 'RendererBaseUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'lastURI',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'newURI',
        type: 'string',
      },
    ],
    name: 'WebsiteURIUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string[]',
        name: '_names',
        type: 'string[]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'propertyId',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'bool',
            name: 'isNewProperty',
            type: 'bool',
          },
        ],
        internalType: 'struct IPropertyIPFS.ItemParam[]',
        name: '_items',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'baseUri',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'extension',
            type: 'string',
          },
        ],
        internalType: 'struct IPropertyIPFS.IPFSGroup',
        name: '_ipfsGroup',
        type: 'tuple',
      },
    ],
    name: 'addProperties',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'attributeMerkleRoot',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contractImage',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contractURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string[]',
        name: '_names',
        type: 'string[]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'propertyId',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'bool',
            name: 'isNewProperty',
            type: 'bool',
          },
        ],
        internalType: 'struct IPropertyIPFS.ItemParam[]',
        name: '_items',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'baseUri',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'extension',
            type: 'string',
          },
        ],
        internalType: 'struct IPropertyIPFS.IPFSGroup',
        name: '_ipfsGroup',
        type: 'tuple',
      },
    ],
    name: 'deleteAndRecreateProperties',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'description',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAdditionalTokenProperties',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'key',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'value',
            type: 'string',
          },
          {
            internalType: 'bool',
            name: 'quote',
            type: 'bool',
          },
        ],
        internalType: 'struct IBaseMetadata.AdditionalTokenProperty[]',
        name: '_additionalTokenProperties',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'getAttributes',
    outputs: [
      {
        internalType: 'string',
        name: 'resultAttributes',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'queryString',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'getRawAttributes',
    outputs: [
      {
        internalType: 'uint16[16]',
        name: 'attributes',
        type: 'uint16[16]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_initStrings',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ipfsDataCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_propertyId',
        type: 'uint256',
      },
    ],
    name: 'itemsCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'onMinted',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'projectURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'propertiesCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rendererBase',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'key',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'value',
            type: 'string',
          },
          {
            internalType: 'bool',
            name: 'quote',
            type: 'bool',
          },
        ],
        internalType: 'struct IBaseMetadata.AdditionalTokenProperty[]',
        name: '_additionalTokenProperties',
        type: 'tuple[]',
      },
    ],
    name: 'setAdditionalTokenProperties',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'attributeMerkleRoot_',
        type: 'bytes32',
      },
    ],
    name: 'setAttributeMerkleRoot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
          {
            internalType: 'uint16[16]',
            name: 'attributes',
            type: 'uint16[16]',
          },
          {
            internalType: 'bytes32[]',
            name: 'proof',
            type: 'bytes32[]',
          },
        ],
        internalType: 'struct IMerklePropertyIPFS.SetAttributeParams',
        name: '_params',
        type: 'tuple',
      },
    ],
    name: 'setAttributes',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
          {
            internalType: 'uint16[16]',
            name: 'attributes',
            type: 'uint16[16]',
          },
          {
            internalType: 'bytes32[]',
            name: 'proof',
            type: 'bytes32[]',
          },
        ],
        internalType: 'struct IMerklePropertyIPFS.SetAttributeParams[]',
        name: '_params',
        type: 'tuple[]',
      },
    ],
    name: 'setManyAttributes',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: '_interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_newContractImage',
        type: 'string',
      },
    ],
    name: 'updateContractImage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_newDescription',
        type: 'string',
      },
    ],
    name: 'updateDescription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_newProjectURI',
        type: 'string',
      },
    ],
    name: 'updateProjectURI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_newRendererBase',
        type: 'string',
      },
    ],
    name: 'updateRendererBase',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const
