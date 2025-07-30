import { EndpointId } from '@layerzerolabs/lz-definitions'
import 'dotenv/config'

export type NetworkKey = keyof typeof NETWORKS
export type Network = (typeof NETWORKS)[NetworkKey]

export const NETWORKS = {
    1: {
        name: 'Ethereum Mainnet',
        networkName: 'mainnet',
        eid: EndpointId.ETHEREUM_V2_MAINNET, // 30101
        lzNetworkName: 'ethereum',
        contractAddress: '0x835B804A52196135ee138ce75B92fC95a660694e',
        rpcUrl: process.env.RPC_URL_ETHEREUM_MAINNET || 'https://eth-mainnet.g.alchemy.com/public',
    },
    43114: {
        name: 'Avalanche Mainnet',
        networkName: 'avalanche-mainnet',
        eid: EndpointId.AVALANCHE_V2_MAINNET, // 30106
        lzNetworkName: 'avalanche',
        contractAddress: '0x74a3D0BEbF2Da3e44Fb262301CA9488B360F6FD1',
        rpcUrl: process.env.RPC_URL_AVALANCHE_MAINNET || 'https://api.avax.network/ext/bc/C/rpc',
    },
    11155111: {
        name: 'Sepolia',
        networkName: 'sepolia-testnet',
        eid: EndpointId.SEPOLIA_V2_TESTNET,
        lzNetworkName: 'sepolia',
        contractAddress: '',
        // contractAddress: '0xaC06f9a6134f8A6f065A19902f3FccE27Ef05AB2', // change address
        rpcUrl: process.env.RPC_URL_SEPOLIA_TESTNET || 'https://rpc.sepolia.org',
    },
    84532: {
        name: 'Base Sepolia',
        networkName: 'base-testnet',
        eid: EndpointId.BASESEP_V2_TESTNET,
        lzNetworkName: 'base-sepolia',
        contractAddress: '',
        // contractAddress: '0x337A47ECbA3873f839c57a04b852aa14A7e3e6ea', // change address
        rpcUrl: process.env.RPC_URL_BASE_TESTNET || 'https://sepolia.base.org',
    },
    40231: {
        name: 'Arbitrum Sepolia',
        networkName: 'arbitrum-sepolia-testnet',
        eid: EndpointId.ARBSEP_V2_TESTNET,
        lzNetworkName: 'arbitrum-sepolia',
        contractAddress: '',
        rpcUrl: process.env.RPC_URL_ARBITRUM_SEPOLIA_TESTNET || 'https://sepolia-rollup.arbitrum.io/rpc',
    },
    43113: {
        name: 'Avalanche Fuji',
        networkName: 'avalanche-fuji-testnet',
        eid: EndpointId.AVALANCHE_V2_TESTNET,
        lzNetworkName: 'fuji',
        contractAddress: '',
        // contractAddress: '0x1a8e01213c440147C4C4F37bA320D44841c6E42c',
        rpcUrl: process.env.RPC_URL_AVALANCHE_FUJI_TESTNET || 'https://api.avax-test.network/ext/bc/C/rpc',
    },
    80002: {
        name: 'Amoy',
        networkName: 'amoy-testnet',
        eid: EndpointId.AMOY_V2_TESTNET,
        lzNetworkName: 'amoy',
        contractAddress: '',
        rpcUrl: process.env.RPC_URL_AMOY_TESTNET || 'https://rpc-amoy.polygon.technology',
    },
    245022926: {
        name: 'Solana Devnet',
        networkName: 'solana-devnet',
        eid: EndpointId.SOLANA_TESTNET,
        lzNetworkName: 'solana-devnet',
        contractAddress: '',
        rpcUrl: process.env.RPC_URL_SOLANA_TESTNET || 'https://api.devnet.solana.com',
    },
    12345: {
        name: 'Hyper EVM',
        networkName: 'hyper-testnet',
        eid: EndpointId.HYPERLIQUID_V2_TESTNET,
        lzNetworkName: 'hyper',
        contractAddress: '', // 배포 후 업데이트
        rpcUrl: process.env.RPC_URL_HYPER_TESTNET || 'https://rpc.testnet.hyper.xyz',
    },
} as const

export const CONTRACT_CONFIG = {
    name: 'KRWIN',
    tokenName: 'KRWIN Stablecoin',
    tokenSymbol: 'KRWIN',
    decimals: 18,
} as const

// export const CONTRACT_CONFIG = {
//     name: 'ABC',
//     tokenName: 'ABC Stablecoin',
//     tokenSymbol: 'ABC',
//     decimals: 18,
// } as const
