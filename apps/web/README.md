# Nouns Builder Web App

This `README` is intended to provide app specific context.

### App Dependencies

Nouns Builder is built on Nextjs and the following dependencies:

- [graphql-request](https://www.npmjs.com/package/graphql-request) - graphql client
- [graphql-codegen](https://the-guild.dev/graphql/codegen) - to generate typed graphql queries
- [swr](https://swr.vercel.app/) - for data fetching and response caching
- [zustand](https://github.com/pmndrs/zustand) - to manage global and persistent state
- [vanilla-extract](https://vanilla-extract.style/) - for styles
- [tenderly](https://docs.tenderly.co/simulations-and-forks/simulation-api) - to simulate transactions
- [formik](https://formik.org/docs/api/formik)
- [wagmi](https://wagmi.sh/)
- [rainbowkit](https://www.rainbowkit.com/)

### Folder organisation

The app is mostly organised by function and for the larger areas of concern there are specific modules that group by domain. Grouping by modules enables tightly coupled components, hooks, utils, constants, etc to be co-located.

- `components` - shared components
- `constants` - shared constants
- `hooks` - shared hooks
- `layouts` - page layouts and associated components
- `pages` - nextjs page and api routes
- `services` - api route services
- `stores` - shared zustand stores
- `styles`
- `test` - test setup and utilities
- `typings` - shared global types
- `utils` - shared utilities
- `data` - network requests
  - `graphql` - generated sdk, queries, fragements, and data transformation helpers
  - `contract` - generated abis, contract reads, and data transformation helpers
- `modules`
  - `auction` - a given token auction
  - `create-dao` - create a dao flow
  - `create-proposal` - create a proposal flow
  - `dao` - dao entity related components, hooks, stores, etc.
  - `proposal` - proposal entity related components, hooks, stores, etc.

### Chain Environment

Nouns Builder currently only supports two networks: `mainnet` and `sepolia testnet`. The environment variables indicated below dictate the network that the app interacts with.

You can swap out the environment variables as defined below to run against mainnnet or testnet locally.

```
# the default network type is defined in .env, to run against testnet
NEXT_PUBLIC_TENDERLY_RPC_KEY=<TENDERLY_RPC_API_KEY>
NEXT_PUBLIC_NETWORK_TYPE="testnet"

# to run against mainnet locally
NEXT_PUBLIC_TENDERLY_RPC_KEY=<TENDERLY_RPC_API_KEY>
NEXT_PUBLIC_NETWORK_TYPE="mainnet"
```

### Writing Tests

We use [vitest](https://vitest.dev) to run tests and [react-testing-library](https://testing-library.com/docs/react-testing-library/intro) for rendering react components and hooks. Some tests might require contract reads or writes and can be run against a local ethereum node (using Anvil).

You can find a custom render function in `test/utils.tsx` that includes wagmi and swr config as a wrapper.

```
import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { useBlockNumber } from 'wagmi'
import { describe, expect, it } from 'vitest'
import { render } from 'src/test/utils'

describe('Block Number', () => {
  it('should render the current block number', async () => {
    const BlockNumber = () => {
      const { data, isLoading, isError } = useBlockNumber()
      if (isLoading) return <div>Fetching block number…</div>
      if (isError) return <div>Error fetching block number</div>
      return <div>Block number: {data}</div>
    }
    render(<BlockNumber />)
    await waitFor(() => expect(screen.getByText(/15578840/)).toBeInTheDocument())
    expect(screen.getByText(/15578840/)).toBeInTheDocument()
  })
})
```

### Generating typed graphql queries

We use [graphql-codegen](https://www.the-guild.dev/graphql/codegen) to generate typed queries for [graphql-request](https://github.com/jasonkuhrt/graphql-request) based off of the Zora [api schema](https://api.zora.co/graphql). The codegen config is defined in `codegen.yml`.

In order to generate a new query:

1. Add relevant queries or fragments to `src/data/graphql/queries` or `src/data/graphql/fragments`
2. Run `pnpm run codegen` to re-generate `sdk.generated.ts`
3. Check in and commit updated `sdk.generated.ts` file
4. Use the generated sdk query and types (as referenced below)

```
// defined query and fragment
query daosByMember($addresses: [String!], $chain: Chain!) {
  nouns {
    nounsDaos(
      networks: { chain: $chain, network: ETHEREUM }
      where: { memberAddresses: $addresses }
      pagination: { limit: 25 }
    ) {
      nodes {
        ...NounsDao
      }
    }
  }
}

// the generated output as an api
sdk.daosByMember({ addresses: ['0x123'], chain: Chain.GOERLI })
```

> Note: `sdk.generated.ts` is auto-generated and should not be touched

> Note: If you use vscode, it might also be helfpul to install the vscode plugin for graphql to pick up syntax highlighting for `.graphql` files.

### Styling

Nouns Builder relies on vanilla extract for styles. We use a combination of Zord and custom styles where needed. You can reference the `Styling with Zord` section in the [Zord README](/packages/zoralabs-zord/README.md) on how best to use Zord.

> Note: The `styles` folder contains legacy page style sheets, going forward only any globally applied styles should be further added there.

Styles should be firstly be applied via Zord in-line utilities (Box, Flex, Grid, etc). If further styles are needed (ie pseudo-class selectors, pseudo-element selectors), then styles can be applied via `className` and should be co-located with the relevant component.

### Contract Versioning

The abis used should always be based off of the latest release of [the Nouns Builder protocol](https://github.com/ourzora/nouns-protocol/releases). When the latest available `contractVersion` is upgraded on the contract level, the front-end needs to reflect to the new available versions accordingly.

> Note: Protocol upgrades are always additive and non-breaking changes.

> Note: The following changes should happen prior to upgrade the Builder manager contract version.

##### To reflect these changes:

Bump the nouns-protocol package version in `package.json` to the latest release

```
"@zoralabs/nouns-protocol": "1.2.0",
```

Re-generate the abis once the updates are installed

```
pnpm run generate-abis
```

Add the version [release notes](https://github.com/ourzora/nouns-protocol/releases) in `versions` for the upgrade proposal for a given version.

```
![](https://i.imgur.com/HrQKZMG.png)

## Summary
This proposal upgrades the DAO to V1.x.0 to add several features, improvements and bug fixes.

### Feature 1
Etc
```

Add version number to the constants

```
export const versions = ['1.1.0', '1.2.0', '1.x.0'] as const
```

The upgrade card feature will automatically pick up these upgrades and make them available once the contract versions are upgrade on the builer manager contract.

### ESLint & Prettier

We use [Husky](https://github.com/typicode/husky) to run ESLint and prettier formatting on pre-push. Please ensure any changes you introduce do not add any further lint warnings.
