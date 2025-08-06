import { HardhatUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'

import '@layerzerolabs/toolbox-hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@openzeppelin/hardhat-upgrades'
import 'dotenv/config'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'

import './tasks'

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
        'ethereum-mainnet': {
            eid: EndpointId.ETHEREUM_V2_MAINNET,
            url: process.env.RPC_URL_ETHEREUM_MAINNET || 'https://eth-mainnet.g.alchemy.com/public',
            accounts: [process.env.PRIVATE_KEY_METAMASK_3!],
        },
        'avalanche-mainnet': {
            eid: EndpointId.AVALANCHE_V2_MAINNET,
            url: process.env.RPC_URL_AVALANCHE_MAINNET || 'https://api.avax.network/ext/bc/C/rpc',
            accounts: [process.env.PRIVATE_KEY_METAMASK_3!],
        },
        'sepolia-testnet': {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            url: process.env.RPC_URL_SEPOLIA_TESTNET || 'https://rpc.sepolia.org',
            accounts: [process.env.PRIVATE_KEY_METAMASK_1 || ''],
        },
        'base-testnet': {
            eid: EndpointId.BASESEP_V2_TESTNET,
            url: process.env.RPC_URL_BASE_TESTNET || 'https://base-sepolia.publicnode.com',
            accounts: [process.env.PRIVATE_KEY_METAMASK_1 || ''],
        },
        'fuji-testnet': {
            eid: EndpointId.AVALANCHE_V2_TESTNET,
            url: process.env.RPC_URL_FUJI_TESTNET || 'https://api.avax-test.network/ext/bc/C/rpc',
            accounts: [process.env.PRIVATE_KEY_METAMASK_2 || ''],
        },
        'kaia-testnet': {
            eid: EndpointId.KLAYTN_V2_TESTNET,
            url: process.env.RPC_URL_KAIA_TESTNET || 'https://rpc.kaia.xyz',
            accounts: [process.env.PRIVATE_KEY_METAMASK_1 || ''],
        },
        'hyper-testnet': {
            eid: EndpointId.HYPERLIQUID_V2_TESTNET,
            url: process.env.RPC_URL_HYPER_TESTNET || 'https://rpc.testnet.hyper.xyz',
            accounts: [process.env.PRIVATE_KEY_METAMASK_1 || ''],
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
