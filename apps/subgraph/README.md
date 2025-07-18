# Nouns Builder Subgraph

## Index

- [Getting Started](#getting-started)
- [Step 1 - Install Dependencies](#step-1---install-dependencies)
- [Step 2 - Set Up a Personal Goldsky API Key](#step-2---set-up-a-personal-goldsky-api-key)
- [Step 3 - Log in with the API Key](#step-3---log-in-with-the-api-key)
- [Step 4 - Build the Subgraph from Source](#step-4---build-the-subgraph-from-source)
- [Step 5 - Deploy the Subgraph to Production](#step-5---deploy-the-subgraph-to-production)
- [Step 6 - Query the Subgraph](#step-6---query-the-subgraph)
- [Production Endpoints](#production-endpoints)

## Getting Started

👉 [Read the Goldsky docs](https://docs.goldsky.com/subgraphs/deploying-subgraphs)

The Nouns Builder subgraph supports the following networks:

- `ethereum-mainnet`
- `ethereum-sepolia`
- `base-mainnet`
- `base-sepolia`
- `optimism-mainnet`
- `optimism-sepolia`
- `zora-mainnet`
- `zora-sepolia`

### Step 1 - Install Dependencies

Navigate to the subgraph directory and run:

```bash
# FROM: ./apps/subgraph
pnpm install
```

### Step 2 - Set Up a Personal Goldsky API Key

1. Request to join the team account at [goldsky.com](https://goldsky.com).
2. Create an API key on your Settings page.
3. Install the Goldsky CLI:
   ```bash
   curl https://goldsky.com | sh
   ```

### Step 3 - Log in with the API Key

Use the API key you created:

```bash
# FROM: ./apps/subgraph
goldsky login
```

### Step 4 - Build the Subgraph from Source

Run the following commands (these scripts are defined in `package.json`):

```bash
# FROM: ./apps/subgraph

# Build for a specific network using the build script
pnpm build:only <network>

# OR use the combined command that cleans and builds
pnpm build:subgraph <network>
```

The build script will:

1. Generate `subgraph.yaml` from the mustache template using the network config
2. Run `pnpm graph:codegen` to generate types
3. Run `pnpm graph:build` to build the subgraph

### Step 5 - Deploy the Subgraph to Production

#### IMPORTANT:

**To avoid downtime during upgrades, maintain a backup subgraph. If issues arise, you can redirect traffic to the backup rather than waiting for redeployment or rollback, which can take hours.**

- The subgraph name follows the pattern `nouns-builder-<network>`, so clients won’t need to update their URI for minor version changes.
- Increase the `specVersion` at the top of `subgraph.yaml.mustache` for each new version.
- Use the **--tag** flag to alias `latest` with the current `specVersion`.

If you are making breaking changes, make sure to notify clients first and provide a migration path.

**Always remember to tag!**

```bash
# FROM: ./apps/subgraph

# Deploy using the deploy script (recommended)
pnpm deploy:only <network> <version>

# OR use the combined command that cleans and deploys
pnpm deploy:subgraph <network> <version>

# Then manually tag the deployment
goldsky subgraph tag create nouns-builder-<network>/<version> --tag latest

# Example:
pnpm deploy:only ethereum-mainnet 0.0.6
goldsky subgraph tag create nouns-builder-ethereum-mainnet/0.0.6 --tag latest
```

### Step 6 - Query the Subgraph

You can now query the subgraph in the Goldsky GraphQL playground to test your changes. **Note: Full indexing may take several hours.**

## Production Endpoints

The subgraph is currently deployed to the following networks:

- [Ethereum](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-ethereum-mainnet/latest/gn)
- [Ethereum Sepolia](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-ethereum-sepolia/latest/gn)
- [Base](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-base-mainnet/latest/gn)
- [Base Sepolia](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-base-sepolia/latest/gn)
- [Optimism](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-optimism-mainnet/latest/gn)
- [Optimism Sepolia](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-optimism-sepolia/latest/gn)
- [Zora](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-zora-mainnet/latest/gn)
- [Zora Sepolia](https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-zora-sepolia/latest/gn)

## (DEPRECATED) Local Development with Docker Compose (TODO: fix - pnpm create:local step not working)

- Build the subgraph with `pnpm build:only <network>`
- Run the local graph node with `pnpm local-node`
- For Mac users on Apple Silicon, use a local image of `graphprotocol/graph-node` (see [instructions here](https://github.com/graphprotocol/graph-node/tree/master/docker)).
- Create the local subgraph with `pnpm create:local`
- Deploy changes to the local subgraph with `pnpm deploy:local`
