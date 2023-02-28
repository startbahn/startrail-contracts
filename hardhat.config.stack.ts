import config from './hardhat.config'
import chainIds from './utils/chain-ids'

// Config for running hardhat in a full Startrail stack.
//
// Configures Hardhat in a way that is compatibile with Torus Web running in
// local mode.
//
// Uses chainId 5777 (ganache) which Torus expects.
// Also runs hardhat on 8546 which allows a TLS proxy to run on 8545 which
// Torus expects when connecting locally.
config.networks.hardhat.chainId = chainIds.ganache;

export default config;
