# ![Builder Avatar](apps/web/public/builder-avatar-circle60x60.png) Nouns Builder Monorepo

This is Nouns Builder front-end website and subgraph mono-repo. You can find Nouns Builder deployed on:

- [Mainnet](//nouns.build)
- [Sepolia testnet](//testnet.nouns.build)

For an introduction to Nouns Builder and its concept, you can find further [documentation here](https://builder-docs.vercel.app/).
You can also find the [nouns protocol code here](https://github.com/ourzora/nouns-protocol).


### Apps and packages in this repository include:

`apps`

- `web`: Nouns Builder front-end
- `subgraph`: Nouns Builder subgraph

`packages`

- `blocklist`: Package to check for sanctioned wallet addresses
- `analytics`: Shareable analytics package
- `zord`: Shareable ui components
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo
- `ipfs-service`: api for image uploads to ipfs

## Quickstart

#### Get up and running

1. Clone this repo locally
2. [Install pnpm](https://pnpm.io/installation#using-corepack)

3. Add the required [environment variables](#environment-variables)

4. Install dependencies across all apps and packages

```
pnpm i
```

5. Once environment variables are defined, you can run the app in dev mode

```
pnpm dev
```

#### Linting and formatting

> Note: linting and prettier formatting are automatically run on pre-push hooks

To lint:

```
pnpm run lint
```

To format:

```
pnpm run format
```

To run type checks:

```
pnpm run type-check
```

#### To create and run a production build

```
> pnpm run build
> pnpm run start
```

## Environment variables

This app has several third party api keys that you need in order to run Builder:

- [Tenderly](https://docs.tenderly.co/simulations-and-forks/simulation-api) as the main rpc node provider and transaction simulator
- [Etherscan](https://docs.etherscan.io/api-endpoints/contracts) to dynamically fetch abis
- [Alchemy](https://www.alchemy.com/) for NFT metadata and balances
- [Redis](https://redis.io/) for caching layer

We ask that you supply your own secrets locally for running in development environment. Non-secret environment variables are already included in the `.env` files in this repo.

Add the following variables to `.env.local` within this root directory (needed to run tests against a local anvil node):

```
ANVIL_FORK_URL=$RPC_URL
ANVIL_BLOCK_NUMBER=8305745
```

Add the following variables to `apps/web/.env.local`:

```
# tenderly RPC
NEXT_PUBLIC_TENDERLY_RPC_KEY=<TENDERLY_API_KEY>

# tenderly simulator env variables
TENDERLY_ACCESS_KEY=<API_KEY>
TENDERLY_PROJECT=<PROJECT_NAME>
TENDERLY_USER=<ACCOUNT_NAME>

# etherscan 
ETHERSCAN_API_KEY=<ETHERSCAN_API_KEY>

# alchemy for NFT/token data
NEXT_PUBLIC_ALCHEMY_API_KEY=<ALCHEMY_API_KEY>

# redis for caching
REDIS_URL=<REDIS_URL>

```

## Running tests

> Note: to run tests you need to [install anvil](https://github.com/foundry-rs/foundry/blob/master/README.md#installation).

Once anvil is installed, you can now locally run anvil (from the root directory in the monorepo) in a separate terminal session to start a local ethereum node:
`pnpm run anvil`

Now you can run the tests in a separate terminal session:
`pnpm run test`

You can also run the tests in watchmode, which will react to any source code or test files changing. To do that, run:
`pnpm run test:watch`

## Deployments

### Client

The Nouns Builder client is deployed on [Vercel](https://vercel.com/). Any pull requests will trigger a new preview deployment providing you with an environment to test out and preview changes.

### Subgraph

The Nouns Builder subgraph is deployed for the following networks:

- [Ethereum](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-ethereum-mainnet/latest/gn)
- [Ethereum Sepolia](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-ethereum-sepolia/latest/gn)
- [Base](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-base-mainnet/latest/gn)
- [Base Sepolia](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-base-sepolia/latest/gn)
- [Optimism](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-optimism-mainnet/latest/gn)
- [Optimism Sepolia](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-optimism-sepolia/latest/gn)
- [Zora](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-zora-mainnet/latest/gn)
- [Zora Sepolia](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-zora-sepolia/latest/gn)

## Contributions

Please refer to our [contributions guideline](/.github/contributing.md) on how best to contribute.

## Questions?

Feel free to reach out to us via [Discord](https://discord.gg/bTygNksyRb)
