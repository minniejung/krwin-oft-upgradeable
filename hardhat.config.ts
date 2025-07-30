// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import '@openzeppelin/hardhat-upgrades'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-deploy-ethers'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'

import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'

import './tasks'

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY_METAMASK_1

const accounts: HttpNetworkAccountsUserConfig | undefined = PRIVATE_KEY ? [PRIVATE_KEY] : undefined

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        version: '0.8.22',
        settings: {
            optimizer: {
                enabled: true,
                runs: 50,
            },
            evmVersion: 'paris',
        },
    },
    networks: {
        'sepolia-testnet': {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            url: process.env.RPC_URL_SEPOLIA_TESTNET || 'https://rpc.sepolia.org',
            accounts,
        },
        'base-testnet': {
            eid: EndpointId.BASESEP_V2_TESTNET,
            url: process.env.RPC_URL_BASE_TESTNET || 'https://base-sepolia.publicnode.com',
            accounts,
        },
        'fuji-testnet': {
            eid: EndpointId.AVALANCHE_V2_TESTNET,
            url: process.env.RPC_URL_FUJI_TESTNET || 'https://api.avax-test.network/ext/bc/C/rpc',
            accounts: [process.env.PRIVATE_KEY_METAMASK_2 || ''],
        },
        'hyper-testnet': {
            eid: EndpointId.HYPERLIQUID_V2_TESTNET,
            url: process.env.RPC_URL_HYPER_TESTNET || 'https://rpc.testnet.hyper.xyz',
            accounts: [process.env.PRIVATE_KEY_METAMASK_1 || ''],
        },
        mainnet: {
            eid: EndpointId.ETHEREUM_V2_MAINNET,
            url: process.env.RPC_URL_ETHEREUM_MAINNET || 'https://eth-mainnet.g.alchemy.com/public',
            accounts: [process.env.PRIVATE_KEY_METAMASK_2!],
        },
        'avalanche-mainnet': {
            eid: EndpointId.AVALANCHE_V2_MAINNET,
            url: process.env.RPC_URL_AVALANCHE_MAINNET || 'https://api.avax.network/ext/bc/C/rpc',
            accounts: [process.env.PRIVATE_KEY_METAMASK_2!],
        },
        hardhat: {
            // Need this for testing because TestHelperOz5.sol is exceeding the compiled contract size limit
            allowUnlimitedContractSize: true,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0, // mainnet
            43114: 0, // avalanche
            11155111: 0, // sepolia
        },
    },
    layerZero: {
        // You can tell hardhat toolbox not to include any deployments (hover over the property name to see full docs)
        deploymentSourcePackages: [],
        // You can tell hardhat not to include any artifacts either
        // artifactSourcePackages: [],
    },
}

export default config
