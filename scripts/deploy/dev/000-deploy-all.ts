import hre from 'hardhat'
import { deployAll } from './deploy-all'

async function main() {
  console.log('\n=====    Local deploy (single run)    ======\n')

  await deployAll(hre)

  console.log('\n=====    Local deploy completed    ======\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


