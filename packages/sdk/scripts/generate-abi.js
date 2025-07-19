const fs = require('fs')

const protocolDir = '../../../protocol'

const artifactsDir = `${protocolDir}/dist/artifacts`

const abisDir = './src/contract/abis'

const targetABIs = ['Token', 'Manager', 'Auction', 'Treasury', 'Governor', 'Metadata']

const artifacts = fs.readdirSync(artifactsDir)

const abis = []

function writeTypescriptFileToDir({ contract, abi }) {
  const contents = `export const ${contract.toLowerCase()}Abi = ${JSON.stringify(
    abi,
    null,
    2
  )} as const`
  console.log(`Writing ${contract}.ts to ${abisDir}...`)
  fs.writeFile(`${abisDir}/${contract}.ts`, contents, (err) => {
    if (err) {
      console.log(`Error writing ${contract}.ts`)
    } else {
      console.log(`${contract}.ts written!`)
    }
  })
}

for (const artifact of artifacts) {
  const files = fs.readdirSync(`${artifactsDir}/${artifact}`, { withFileTypes: false })
  const filteredFiles = files.filter((file) =>
    targetABIs.includes(file.replace('.json', ''))
  )

  if (filteredFiles.length) {
    for (const file of filteredFiles) {
      const contents = fs.readFileSync(`${artifactsDir}/${artifact}/${file}`)
      const json = JSON.parse(contents)
      abis.push({ contract: file.replace('.json', ''), abi: json.abi })
    }
  }
}

if (abis.length) {
  abis.forEach(({ contract, abi }) => writeTypescriptFileToDir({ contract, abi }))
}
